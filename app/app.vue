<template>
  <div class="relative h-full w-full">
    <NuxtRouteAnnouncer />
    <BackgroundManager />
    <WidgetGrid />
    <WakeLockBadge :mode="wakeLock.mode.value" :error="wakeLock.error.value" />
    <BackgroundSettings />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const wakeLock = useWakeLock()

onMounted(() => {
  wakeLock.request()
})
</script>
