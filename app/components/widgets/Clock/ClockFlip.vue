<template>
  <div class="flex h-full w-full items-center justify-center gap-[1.5cqw]">
    <ClockFlipDigit :digit="hours.charAt(0)" />
    <ClockFlipDigit :digit="hours.charAt(1)" />
    <span class="text-surface-600 font-display text-[min(30cqh,8cqw)]">:</span>
    <ClockFlipDigit :digit="minutes.charAt(0)" />
    <ClockFlipDigit :digit="minutes.charAt(1)" />
    <template v-if="showSeconds">
      <span class="text-surface-600 font-display text-[min(30cqh,8cqw)]"
        >:</span
      >
      <ClockFlipDigit :digit="seconds.charAt(0)" />
      <ClockFlipDigit :digit="seconds.charAt(1)" />
    </template>
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

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

const hours = computed(() => {
  let h = now.value.getHours()
  if (props.hour12) {
    h = h % 12
    if (h === 0) h = 12
  }
  return pad(h)
})

const minutes = computed(() => pad(now.value.getMinutes()))
const seconds = computed(() => pad(now.value.getSeconds()))
</script>
