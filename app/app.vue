<template>
  <div class="bg-surface-950 relative h-full w-full">
    <NuxtRouteAnnouncer />
    <WidgetGrid />
    <WakeLockBadge :mode="wakeLock.mode.value" :error="wakeLock.error.value" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const wakeLock = useWakeLock()

onMounted(() => {
  wakeLock.request()
})
</script>
