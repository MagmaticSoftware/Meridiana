<template>
  <div
    class="flex h-full w-full flex-col items-center justify-center gap-[3cqh] overflow-hidden"
  >
    <div
      v-if="variant === 'stacked'"
      class="font-display flex flex-col items-center leading-[0.84] font-bold tracking-[-0.04em] tabular-nums"
      :style="{
        fontSize: showDate ? 'min(38cqh, 60cqw)' : 'min(46cqh, 66cqw)',
      }"
    >
      <span class="text-accent">{{ parts.hours.padStart(2, '0') }}</span>
      <span class="text-ink">{{ parts.minutes }}</span>
    </div>

    <div
      v-else
      class="flex items-baseline leading-[0.9] whitespace-nowrap tabular-nums"
      :class="look.text"
      :style="{ fontSize }"
    >
      <span>{{ parts.hours }}</span>
      <span :class="look.colon">:</span>
      <span>{{ parts.minutes }}</span>
      <span
        v-if="showSeconds"
        :class="look.seconds"
        :style="{ fontSize: `${look.secondsScale}em` }"
      >
        <span :class="look.colon">:</span>{{ parts.seconds }}
      </span>
      <span
        v-if="parts.period"
        class="text-ink-muted ml-[0.45em] text-[0.28em] font-semibold tracking-normal"
      >
        {{ parts.period }}
      </span>
    </div>

    <ClockDateLine v-if="showDate" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '~/composables/useNow'
import { getTimeParts } from '~~/lib/time/format'
import type { ClockStyleProps, DigitalClockStyle } from './types'

const props = withDefaults(
  defineProps<ClockStyleProps & { variant: DigitalClockStyle }>(),
  { hour12: false, showSeconds: true, showDate: false },
)

const now = useNow()
const parts = computed(() => getTimeParts(now.value, { hour12: props.hour12 }))

// Typography per style. `digit`/`colon` are approximate glyph advances in
// em, used to fit the whole time string to the widget's width.
const looks = {
  minimal: {
    text: 'font-sans font-extralight tracking-[-0.03em] text-ink',
    colon: 'text-ink-subtle',
    seconds: 'text-ink-muted font-light',
    secondsScale: 0.42,
    digit: 0.6,
    colon_: 0.3,
  },
  bold: {
    text: 'font-display font-extrabold tracking-[-0.045em] text-ink',
    colon: 'text-accent',
    seconds: 'text-ink-subtle font-bold',
    secondsScale: 0.42,
    digit: 0.58,
    colon_: 0.26,
  },
  condensed: {
    text: 'font-condensed font-medium tracking-[-0.01em] text-ink',
    colon: 'text-ink-muted',
    seconds: '',
    secondsScale: 1,
    digit: 0.5,
    colon_: 0.24,
  },
} as const

const look = computed(() =>
  props.variant === 'stacked' ? looks.minimal : looks[props.variant],
)

const fontSize = computed(() => {
  const { digit, colon_, secondsScale } = look.value
  let em = 4 * digit + colon_
  if (props.showSeconds) em += secondsScale * (2 * digit + colon_)
  if (props.hour12) em += 0.28 * 1.6 + 0.12
  const height = props.showDate ? 58 : 76
  return `min(${(90 / em).toFixed(2)}cqw, ${height}cqh)`
})
</script>
