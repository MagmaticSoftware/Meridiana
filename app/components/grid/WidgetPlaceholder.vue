<template>
  <div
    class="border-surface-600 text-surface-400 flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed"
  >
    <span class="text-xs tracking-wide uppercase">{{ widgetId }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  widgetId: string
}>()
</script>
