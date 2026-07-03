<template>
  <div
    class="bg-surface-950 fixed inset-0 -z-10 overflow-hidden"
    :style="presetStyle"
  >
    <ClientOnly>
      <Transition name="fade">
        <img
          v-if="isImageMode && bg.currentUrl.value"
          :key="bg.currentUrl.value"
          :src="bg.currentUrl.value"
          alt=""
          class="absolute inset-0 h-full w-full object-cover"
        />
      </Transition>
      <video
        v-if="store.mode === 'video' && bg.currentUrl.value"
        :key="bg.currentUrl.value"
        :src="bg.currentUrl.value"
        class="absolute inset-0 h-full w-full object-cover"
        autoplay
        muted
        loop
        playsinline
      />
    </ClientOnly>
    <div class="absolute inset-0" :style="overlayStyle" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBackground } from '~/composables/useBackground'
import { useBackgroundStore } from '~/stores/background'
import { getBackgroundPreset } from '~~/lib/backgrounds/presets'

const store = useBackgroundStore()
const bg = useBackground()

const isImageMode = computed(
  () => store.mode === 'single' || store.mode === 'gallery',
)

const presetStyle = computed(() => {
  if (store.mode !== 'preset') return {}
  return getBackgroundPreset(store.presetId)?.style ?? {}
})

const overlayStyle = computed(() => {
  const { dim, blur, gradient } = store.overlay
  const layers: string[] = []
  if (gradient) {
    layers.push(
      'linear-gradient(to top, rgba(16,13,10,0.55), rgba(16,13,10,0) 45%)',
    )
  }
  if (dim > 0) {
    layers.push(`linear-gradient(rgba(16,13,10,${dim}), rgba(16,13,10,${dim}))`)
  }
  return {
    background: layers.length > 0 ? layers.join(', ') : undefined,
    backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-leave-active {
  position: absolute;
  inset: 0;
}
</style>
