<template>
  <div class="h-full w-full [container-type:size]">
    <ClockFlip
      v-if="variant === 'flip'"
      :hour12="hour12"
      :show-seconds="showSeconds"
      :show-date="showDate"
    />
    <div
      v-else-if="variant === 'analog'"
      class="flex h-full w-full flex-col items-center justify-center gap-[4cqh]"
    >
      <AnalogFace
        :date="now"
        :show-seconds="showSeconds"
        class="aspect-square min-h-0 max-w-full flex-1"
      />
      <ClockDateLine v-if="showDate" />
    </div>
    <ClockDigital
      v-else
      :variant="variant"
      :hour12="hour12"
      :show-seconds="showSeconds"
      :show-date="showDate"
    />
  </div>
</template>

<script setup lang="ts">
import { useNow } from '~/composables/useNow'
import type { ClockStyle } from './types'

withDefaults(
  defineProps<{
    size?: { w: number; h: number }
    variant?: ClockStyle
    hour12?: boolean
    showSeconds?: boolean
    showDate?: boolean
  }>(),
  {
    size: () => ({ w: 1, h: 1 }),
    variant: 'minimal',
    hour12: false,
    showSeconds: true,
    showDate: false,
  },
)

const now = useNow()
</script>
