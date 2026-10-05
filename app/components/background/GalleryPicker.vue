<template>
  <div class="grid grid-cols-3 gap-2">
    <div
      v-for="id in store.galleryImageIds"
      :key="id"
      class="group bg-tint relative aspect-[4/3] overflow-hidden rounded-xl"
    >
      <img
        v-if="thumbnails.get(id)"
        :src="thumbnails.get(id)"
        alt=""
        class="h-full w-full object-cover"
      />
      <button
        type="button"
        class="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        aria-label="Remove image"
        @click="handleRemove(id)"
      >
        <AppIcon name="close" class="h-3 w-3" :stroke-width="2.4" />
      </button>
    </div>
    <label
      class="border-line text-ink-muted hover:border-accent hover:text-ink flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-xs transition-colors"
    >
      <AppIcon name="plus" class="h-4 w-4" />
      Add
      <input
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        @change="handleAdd"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, reactive, watch } from 'vue'
import { useBackgroundAssets } from '~/composables/useBackground'
import { useBackgroundStore } from '~/stores/background'
import { getAsset } from '~~/lib/storage/idb'

const store = useBackgroundStore()
const assets = useBackgroundAssets()

const thumbnails = reactive(new Map<string, string>())

async function loadThumbnail(id: string) {
  if (thumbnails.has(id)) return
  const blob = await getAsset(id)
  if (blob) thumbnails.set(id, URL.createObjectURL(blob))
}

watch(
  () => store.galleryImageIds,
  (ids) => {
    for (const id of ids) loadThumbnail(id)
  },
  { immediate: true, deep: true },
)

onUnmounted(() => {
  for (const url of thumbnails.values()) URL.revokeObjectURL(url)
})

async function handleAdd(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  for (const file of files) await assets.addGalleryImage(file)
}

function handleRemove(id: string) {
  assets.removeGalleryImage(id)
  const url = thumbnails.get(id)
  if (url) {
    URL.revokeObjectURL(url)
    thumbnails.delete(id)
  }
}
</script>
