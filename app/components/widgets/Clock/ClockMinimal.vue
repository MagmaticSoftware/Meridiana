<template>
  <div class="flex h-full w-full items-center justify-center">
    <span
      class="font-display text-surface-50 text-[min(20cqw,45cqh)] leading-none font-light tracking-tight tabular-nums"
    >
      {{ display }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '~/composables/useNow'
import type { ClockStyleProps } from './types'

const props = withDefaults(defineProps<ClockStyleProps>(), {
  hour12: false,
  showSeconds: true,
})

const now = useNow(1000)

const display = computed(() =>
  now.value.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: props.showSeconds ? '2-digit' : undefined,
    hour12: props.hour12,
  }),
)
</script>
