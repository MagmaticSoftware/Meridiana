<template>
  <div class="space-y-5">
    <UiSegmented v-model="store.mode" :options="modes" />

    <section v-if="store.mode === 'preset'" class="grid grid-cols-3 gap-2">
      <button
        v-for="preset in presets"
        :key="preset.id"
        type="button"
        class="group relative aspect-[4/3] overflow-hidden rounded-xl ring-offset-2 ring-offset-[var(--panel-bg)] transition-transform hover:scale-[1.03]"
        :class="store.presetId === preset.id ? 'ring-accent ring-2' : ''"
        :style="preset.style"
        :title="preset.name"
        @click="store.presetId = preset.id"
      >
        <span
          class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pt-4 pb-1.5 text-left text-[11px] font-medium text-white"
        >
          {{ preset.name }}
        </span>
      </button>
    </section>

    <label v-else-if="store.mode === 'single'" :class="dropClass">
      <AppIcon name="image" class="h-5 w-5" />
      {{ store.singleImageId ? 'Replace image…' : 'Choose an image…' }}
      <input
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFile($event, assets.setSingleImage)"
      />
    </label>

    <section v-else-if="store.mode === 'gallery'" class="space-y-3">
      <GalleryPicker />
      <UiRow label="Next image every">
        <span class="flex items-center gap-2">
          <input
            v-model.number="store.galleryIntervalSec"
            type="number"
            min="5"
            class="ui-input w-20! text-center"
          />
          <span class="text-ink-muted text-sm">sec</span>
        </span>
      </UiRow>
    </section>

    <label v-else-if="store.mode === 'video'" :class="dropClass">
      <AppIcon name="upload" class="h-5 w-5" />
      {{ store.videoId ? 'Replace video…' : 'Choose a looping video…' }}
      <input
        type="file"
        accept="video/*"
        class="hidden"
        @change="onFile($event, assets.setVideo)"
      />
    </label>

    <section class="space-y-1">
      <h3 class="ui-label mb-1">Overlay</h3>
      <UiRow label="Dim">
        <input
          v-model.number="store.overlay.dim"
          type="range"
          min="0"
          max="0.8"
          step="0.05"
          class="ui-range max-w-40"
        />
      </UiRow>
      <UiRow label="Blur">
        <input
          v-model.number="store.overlay.blur"
          type="range"
          min="0"
          max="24"
          step="1"
          class="ui-range max-w-40"
        />
      </UiRow>
      <UiRow label="Bottom shade">
        <UiSwitch v-model="store.overlay.gradient" />
      </UiRow>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useBackgroundAssets } from '~/composables/useBackground'
import { useBackgroundStore } from '~/stores/background'
import type { BackgroundMode } from '~/stores/background'
import { backgroundPresets } from '~~/lib/backgrounds/presets'

const store = useBackgroundStore()
const assets = useBackgroundAssets()
const presets = backgroundPresets

const modes: { label: string; value: BackgroundMode }[] = [
  { label: 'Presets', value: 'preset' },
  { label: 'Image', value: 'single' },
  { label: 'Gallery', value: 'gallery' },
  { label: 'Video', value: 'video' },
]

const dropClass =
  'border-line text-ink-muted hover:border-accent hover:text-ink flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-3 py-6 text-sm transition-colors'

function onFile(event: Event, handler: (file: File) => Promise<void>) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) handler(file)
  input.value = ''
}
</script>
