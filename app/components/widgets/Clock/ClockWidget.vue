<template>
  <div class="h-full w-full [container-type:size]">
    <ClientOnly>
      <ClockFlip
        v-if="variant === 'flip'"
        :hour12="hour12"
        :show-seconds="showSeconds"
      />
      <ClockAnalog v-else-if="variant === 'analog'" />
      <ClockMinimal v-else :hour12="hour12" :show-seconds="showSeconds" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { ClockStyle } from './types'

withDefaults(
  defineProps<{
    size?: { w: number; h: number }
    variant?: ClockStyle
    hour12?: boolean
    showSeconds?: boolean
  }>(),
  {
    size: () => ({ w: 1, h: 1 }),
    variant: 'minimal',
    hour12: false,
    showSeconds: true,
  },
)
</script>
