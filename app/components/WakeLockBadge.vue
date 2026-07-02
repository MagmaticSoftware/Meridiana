<template>
  <div
    class="bg-surface-900/80 text-surface-300 shadow-soft fixed right-4 bottom-4 flex items-center gap-2 rounded-full border border-white/5 px-3 py-1.5 text-xs backdrop-blur"
  >
    <span
      class="h-1.5 w-1.5 rounded-full"
      :class="{
        'bg-accent-400': mode === 'native',
        'bg-accent-300': mode === 'fallback',
        'bg-surface-500': mode === 'inactive',
      }"
    />
    <span>{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WakeLockMode } from '~/composables/useWakeLock'

const props = defineProps<{
  mode: WakeLockMode
  error: string | null
}>()

const label = computed(() => {
  if (props.error) return `Wake lock error: ${props.error}`
  if (props.mode === 'native') return 'Screen awake (native)'
  if (props.mode === 'fallback') return 'Screen awake (fallback)'
  return 'Screen lock inactive'
})
</script>
