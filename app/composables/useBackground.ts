import { onUnmounted, readonly, ref, watch } from 'vue'
import { useBackgroundStore } from '~/stores/background'
import { deleteAsset, getAsset, saveAsset } from '~~/lib/storage/idb'

export function useBackground() {
  const store = useBackgroundStore()
  const currentUrl = ref<string | null>(null)
  const galleryIndex = ref(0)

  let objectUrl: string | null = null
  let rotationTimer: ReturnType<typeof setInterval> | undefined

  function revokeCurrent() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = null
    }
  }

  async function resolveUrl(assetId: string | null) {
    revokeCurrent()
    if (!assetId) return null
    const blob = await getAsset(assetId)
    if (!blob) return null
    objectUrl = URL.createObjectURL(blob)
    return objectUrl
  }

  async function refresh() {
    if (store.mode === 'single') {
      currentUrl.value = await resolveUrl(store.singleImageId)
    } else if (store.mode === 'gallery' && store.galleryImageIds.length > 0) {
      galleryIndex.value = galleryIndex.value % store.galleryImageIds.length
      currentUrl.value = await resolveUrl(
        store.galleryImageIds[galleryIndex.value] ?? null,
      )
    } else if (store.mode === 'video') {
      currentUrl.value = await resolveUrl(store.videoId)
    } else {
      revokeCurrent()
      currentUrl.value = null
    }
  }

  function stopGalleryRotation() {
    if (rotationTimer) {
      clearInterval(rotationTimer)
      rotationTimer = undefined
    }
  }

  function startGalleryRotation() {
    stopGalleryRotation()
    if (store.mode !== 'gallery' || store.galleryImageIds.length < 2) return
    rotationTimer = setInterval(() => {
      galleryIndex.value =
        (galleryIndex.value + 1) % store.galleryImageIds.length
      refresh()
    }, store.galleryIntervalSec * 1000)
  }

  watch(
    () => [
      store.mode,
      store.singleImageId,
      store.videoId,
      store.galleryImageIds,
      store.galleryIntervalSec,
    ],
    () => {
      if (import.meta.server) return
      galleryIndex.value = 0
      refresh()
      startGalleryRotation()
    },
    { immediate: true, deep: true },
  )

  onUnmounted(() => {
    stopGalleryRotation()
    revokeCurrent()
  })

  async function setSingleImage(file: File) {
    const id = crypto.randomUUID()
    await saveAsset(id, file)
    const previous = store.singleImageId
    store.singleImageId = id
    store.mode = 'single'
    if (previous) await deleteAsset(previous).catch(() => {})
  }

  async function addGalleryImage(file: File) {
    const id = crypto.randomUUID()
    await saveAsset(id, file)
    store.galleryImageIds.push(id)
  }

  async function removeGalleryImage(id: string) {
    store.galleryImageIds = store.galleryImageIds.filter(
      (imageId) => imageId !== id,
    )
    await deleteAsset(id).catch(() => {})
  }

  async function setVideo(file: File) {
    const id = crypto.randomUUID()
    await saveAsset(id, file)
    const previous = store.videoId
    store.videoId = id
    store.mode = 'video'
    if (previous) await deleteAsset(previous).catch(() => {})
  }

  return {
    store,
    currentUrl: readonly(currentUrl),
    setSingleImage,
    addGalleryImage,
    removeGalleryImage,
    setVideo,
  }
}
