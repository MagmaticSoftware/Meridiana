<template>
  <div class="fixed inset-0 -z-10 overflow-hidden bg-[#0a1626]">
    <!-- The preset is always painted underneath, so image/video modes
         without an asset yet (or while loading) never show a blank screen. -->
    <div class="absolute inset-0" :style="presetStyle" />
    <Transition name="fade">
      <img
        v-if="isImageMode && source.currentUrl.value"
        :key="source.currentUrl.value"
        :src="source.currentUrl.value"
        alt=""
        class="absolute inset-0 h-full w-full object-cover"
      />
    </Transition>
    <video
      v-if="store.mode === 'video' && source.currentUrl.value"
      :key="source.currentUrl.value"
      :src="source.currentUrl.value"
      class="absolute inset-0 h-full w-full object-cover"
      autoplay
      muted
      loop
      playsinline
    />
    <div class="absolute inset-0" :style="overlayStyle" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBackgroundSource } from '~/composables/useBackground'
import { useBackgroundStore } from '~/stores/background'
import { getBackgroundPreset } from '~~/lib/backgrounds/presets'

const store = useBackgroundStore()
const source = useBackgroundSource()

const isImageMode = computed(
  () => store.mode === 'single' || store.mode === 'gallery',
)

const presetStyle = computed(() => getBackgroundPreset(store.presetId).style)

const overlayStyle = computed(() => {
  const { dim, blur, gradient } = store.overlay
  const layers: string[] = []
  if (gradient) {
    layers.push(
      'linear-gradient(to top, rgba(5,10,20,0.6), rgba(5,10,20,0) 50%)',
    )
  }
  if (dim > 0) {
    layers.push(`linear-gradient(rgba(5,10,20,${dim}), rgba(5,10,20,${dim}))`)
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
  transition: opacity 1.2s ease;
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
