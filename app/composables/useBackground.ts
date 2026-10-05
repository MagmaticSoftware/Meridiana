import { onUnmounted, readonly, ref, watch } from 'vue'
import { useBackgroundStore } from '~/stores/background'
import { deleteAsset, getAsset, saveAsset } from '~~/lib/storage/idb'

/**
 * Resolves the active background asset (single image, rotating gallery or
 * video) to an object URL. Owns timers and object URLs, so it must only be
 * used once — by `BackgroundManager`.
 */
export function useBackgroundSource() {
  const store = useBackgroundStore()
  const currentUrl = ref<string | null>(null)
  const galleryIndex = ref(0)

  let objectUrl: string | null = null
  let rotationTimer: ReturnType<typeof setInterval> | undefined
  // Guards against an older, slower IndexedDB read overwriting a newer one.
  let requestId = 0

  function revokeCurrent() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = null
    }
  }

  function activeAssetId(): string | null {
    if (store.mode === 'single') return store.singleImageId
    if (store.mode === 'video') return store.videoId
    if (store.mode === 'gallery' && store.galleryImageIds.length > 0) {
      galleryIndex.value %= store.galleryImageIds.length
      return store.galleryImageIds[galleryIndex.value] ?? null
    }
    return null
  }

  async function refresh() {
    const id = ++requestId
    const assetId = activeAssetId()
    const blob = assetId
      ? await getAsset(assetId).catch(() => undefined)
      : undefined
    if (id !== requestId) return
    revokeCurrent()
    objectUrl = blob ? URL.createObjectURL(blob) : null
    currentUrl.value = objectUrl
  }

  function stopGalleryRotation() {
    clearInterval(rotationTimer)
    rotationTimer = undefined
  }

  function startGalleryRotation() {
    stopGalleryRotation()
    if (store.mode !== 'gallery' || store.galleryImageIds.length < 2) return
    rotationTimer = setInterval(
      () => {
        galleryIndex.value =
          (galleryIndex.value + 1) % store.galleryImageIds.length
        refresh()
      },
      Math.max(5, store.galleryIntervalSec) * 1000,
    )
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

  return { currentUrl: readonly(currentUrl) }
}

/** Stateless actions that store background assets in IndexedDB. */
export function useBackgroundAssets() {
  const store = useBackgroundStore()

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

  return { setSingleImage, addGalleryImage, removeGalleryImage, setVideo }
}
