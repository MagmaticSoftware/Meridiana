<template>
  <div
    class="relative h-full w-full overflow-hidden"
    :class="{ 'cursor-none': controlsHidden }"
    :data-tone="appearance.tone"
    :data-material="appearance.material"
    :style="accentVars"
  >
    <NuxtRouteAnnouncer />
    <NuxtPwaAssets />
    <BackgroundManager />
    <WidgetGrid />
    <template v-if="!editor.fullscreenItemId">
      <AppDock
        :hidden="controlsHidden"
        :wake-lock="{ mode: wakeLock.mode.value, error: wakeLock.error.value }"
        @request-wake-lock="wakeLock.request()"
      />
      <WidgetSettingsPanel />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useAppearanceStore } from '~/stores/appearance'
import { useEditorStore } from '~/stores/editor'
import { useIdle } from '~/composables/useIdle'
import { useWakeLock } from '~/composables/useWakeLock'
import { getAccent } from '~~/lib/theme/accents'

const wakeLock = useWakeLock()
const editor = useEditorStore()
const appearance = useAppearanceStore()
const idle = useIdle(4000)

const accentVars = computed(() => {
  const accent = getAccent(appearance.accentId)
  return { '--accent': accent.color, '--accent-ink': accent.onColor }
})

// Controls fade away (and the cursor hides) while the screensaver is
// untouched, but never while the user is in the middle of something.
const controlsHidden = computed(
  () =>
    appearance.autoHideControls &&
    idle.value &&
    !editor.isEditing &&
    !editor.activePanel &&
    !editor.selectedItemId,
)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') editor.handleEscape()
}

onMounted(() => {
  wakeLock.request()
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>
