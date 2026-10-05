<template>
  <div
    class="text-ink-subtle border-line flex h-full w-full items-center justify-center rounded-[var(--radius-card)] border border-dashed"
  >
    <span class="text-xs tracking-wide uppercase">{{ widgetId }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  widgetId: string
}>()
</script>
