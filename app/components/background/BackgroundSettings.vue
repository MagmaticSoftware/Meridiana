<template>
  <div class="fixed bottom-4 left-4 z-10">
    <button
      type="button"
      class="bg-surface-900/80 text-surface-300 shadow-soft flex h-9 w-9 items-center justify-center rounded-full border border-white/5 backdrop-blur"
      aria-label="Background settings"
      @click="open = !open"
    >
      ⚙
    </button>

    <div
      v-if="open"
      class="bg-surface-900/95 shadow-soft-lg border-surface-700 absolute bottom-12 left-0 w-80 space-y-4 rounded-2xl border p-4 text-sm backdrop-blur"
    >
      <div class="flex gap-1">
        <button
          v-for="option in modes"
          :key="option"
          type="button"
          class="flex-1 rounded-lg px-2 py-1.5 text-xs capitalize"
          :class="
            store.mode === option
              ? 'bg-accent-500 text-surface-950'
              : 'text-surface-400 hover:text-surface-100'
          "
          @click="store.mode = option"
        >
          {{ option }}
        </button>
      </div>

      <div v-if="store.mode === 'preset'" class="grid grid-cols-3 gap-2">
        <button
          v-for="preset in presets"
          :key="preset.id"
          type="button"
          class="h-12 rounded-lg border-2"
          :class="
            store.presetId === preset.id
              ? 'border-accent-400'
              : 'border-transparent'
          "
          :style="preset.style"
          :title="preset.name"
          @click="store.presetId = preset.id"
        />
      </div>

      <div v-else-if="store.mode === 'single'" class="space-y-2">
        <label
          class="border-surface-600 text-surface-400 block cursor-pointer rounded-lg border border-dashed px-3 py-2 text-center text-xs"
        >
          Choose image…
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleSingleUpload"
          />
        </label>
      </div>

      <div v-else-if="store.mode === 'gallery'" class="space-y-2">
        <GalleryPicker />
        <label class="text-surface-400 flex items-center gap-2 text-xs">
          Rotate every
          <input
            v-model.number="store.galleryIntervalSec"
            type="number"
            min="5"
            class="bg-surface-800 w-16 rounded px-1.5 py-1 text-center"
          />
          seconds
        </label>
      </div>

      <div v-else-if="store.mode === 'video'" class="space-y-2">
        <label
          class="border-surface-600 text-surface-400 block cursor-pointer rounded-lg border border-dashed px-3 py-2 text-center text-xs"
        >
          Choose video…
          <input
            type="file"
            accept="video/*"
            class="hidden"
            @change="handleVideoUpload"
          />
        </label>
      </div>

      <div class="border-surface-700 space-y-2 border-t pt-3">
        <label class="text-surface-400 flex items-center gap-2 text-xs">
          Dim
          <input
            v-model.number="store.overlay.dim"
            type="range"
            min="0"
            max="1"
            step="0.05"
            class="flex-1"
          />
        </label>
        <label class="text-surface-400 flex items-center gap-2 text-xs">
          Blur
          <input
            v-model.number="store.overlay.blur"
            type="range"
            min="0"
            max="20"
            step="1"
            class="flex-1"
          />
        </label>
        <label class="text-surface-400 flex items-center gap-2 text-xs">
          <input v-model="store.overlay.gradient" type="checkbox" />
          Bottom gradient
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBackground } from '~/composables/useBackground'
import { useBackgroundStore } from '~/stores/background'
import { backgroundPresets } from '~~/lib/backgrounds/presets'
import type { BackgroundMode } from '~/stores/background'

const store = useBackgroundStore()
const bg = useBackground()

const open = ref(false)
const modes: BackgroundMode[] = ['preset', 'single', 'gallery', 'video']
const presets = backgroundPresets

function handleSingleUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) bg.setSingleImage(file)
  input.value = ''
}

function handleVideoUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) bg.setVideo(file)
  input.value = ''
}
</script>
