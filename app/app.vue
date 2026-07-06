<template>
  <div class="relative h-full w-full">
    <NuxtRouteAnnouncer />
    <NuxtPwaAssets />
    <BackgroundManager />
    <WidgetGrid />
    <template v-if="!editor.fullscreenItemId">
      <WakeLockBadge
        :mode="wakeLock.mode.value"
        :error="wakeLock.error.value"
      />
      <BackgroundSettings />
      <EditModeToggle />
      <WidgetPicker v-if="editor.isEditing" />
      <WidgetSettingsPanel />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useEditorStore } from '~/stores/editor'

const wakeLock = useWakeLock()
const editor = useEditorStore()

onMounted(() => {
  wakeLock.request()
})
</script>
