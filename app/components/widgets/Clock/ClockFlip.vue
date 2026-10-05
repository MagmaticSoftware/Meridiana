<template>
  <div
    class="flex h-full w-full flex-col items-center justify-center gap-[5cqh]"
  >
    <div class="flex items-center" :style="{ fontSize, gap: '0.06em' }">
      <template v-for="(group, g) in groups" :key="g">
        <span
          v-if="g > 0"
          class="flex w-[0.24em] flex-col items-center gap-[0.16em]"
          aria-hidden="true"
        >
          <span class="bg-ink-subtle h-[0.08em] w-[0.08em] rounded-full" />
          <span class="bg-ink-subtle h-[0.08em] w-[0.08em] rounded-full" />
        </span>
        <ClockFlipDigit
          v-for="(digit, i) in group"
          :key="`${g}-${i}`"
          :digit="digit"
        />
      </template>
    </div>
    <ClockDateLine v-if="showDate" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '~/composables/useNow'
import { getTimeParts } from '~~/lib/time/format'
import type { ClockStyleProps } from './types'

const props = withDefaults(defineProps<ClockStyleProps>(), {
  hour12: false,
  showSeconds: true,
  showDate: false,
})

const now = useNow()

const groups = computed(() => {
  const parts = getTimeParts(now.value, { hour12: props.hour12 })
  const result = [parts.hours.padStart(2, '0'), parts.minutes]
  if (props.showSeconds) result.push(parts.seconds)
  return result.map((pair) => pair.split(''))
})

// Each tile is 0.72em wide; separators 0.24em; gaps 0.06em.
const fontSize = computed(() => {
  const tiles = props.showSeconds ? 6 : 4
  const separators = props.showSeconds ? 2 : 1
  const em = tiles * 0.72 + separators * 0.24 + (tiles + separators - 1) * 0.06
  const height = props.showDate ? 62 : 82
  return `min(${(94 / em).toFixed(2)}cqw, ${(height / 1.04).toFixed(2)}cqh)`
})
</script>
