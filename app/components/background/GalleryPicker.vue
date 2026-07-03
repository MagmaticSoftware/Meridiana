<template>
  <div class="flex flex-wrap gap-2">
    <div
      v-for="id in store.galleryImageIds"
      :key="id"
      class="group border-surface-700 relative h-16 w-24 overflow-hidden rounded-md border"
    >
      <img
        v-if="thumbnails.get(id)"
        :src="thumbnails.get(id)"
        alt=""
        class="h-full w-full object-cover"
      />
      <button
        type="button"
        class="absolute top-1 right-1 hidden h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white group-hover:flex"
        @click="handleRemove(id)"
      >
        &times;
      </button>
    </div>
    <label
      class="border-surface-600 text-surface-400 flex h-16 w-24 cursor-pointer items-center justify-center rounded-md border border-dashed text-xs"
    >
      + Add
      <input type="file" accept="image/*" class="hidden" @change="handleAdd" />
    </label>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, reactive, watch } from 'vue'
import { useBackground } from '~/composables/useBackground'
import { useBackgroundStore } from '~/stores/background'
import { getAsset } from '~~/lib/storage/idb'

const store = useBackgroundStore()
const bg = useBackground()

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

function handleAdd(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) bg.addGalleryImage(file)
  input.value = ''
}

function handleRemove(id: string) {
  bg.removeGalleryImage(id)
  const url = thumbnails.get(id)
  if (url) {
    URL.revokeObjectURL(url)
    thumbnails.delete(id)
  }
}
</script>
