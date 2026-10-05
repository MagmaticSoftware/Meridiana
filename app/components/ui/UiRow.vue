<template>
  <div class="flex items-center justify-between gap-3 py-1">
    <span class="text-ink-muted text-sm">{{ label }}</span>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string }>()
</script>
