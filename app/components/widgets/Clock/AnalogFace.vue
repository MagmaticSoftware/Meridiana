<template>
  <svg
    viewBox="0 0 100 100"
    class="block overflow-visible"
    role="img"
    :aria-label="`${parts.hours}:${parts.minutes}`"
  >
    <circle
      cx="50"
      cy="50"
      r="49"
      :fill="colors.face"
      :stroke="colors.ring"
      stroke-width="0.6"
    />

    <line
      v-for="tick in ticks"
      :key="tick.i"
      :x1="tick.x1"
      :y1="tick.y1"
      :x2="tick.x2"
      :y2="tick.y2"
      :stroke="colors.ink"
      :stroke-opacity="tick.major ? 0.55 : 0.2"
      :stroke-width="tick.major ? 1 : 0.5"
      stroke-linecap="round"
    />

    <template v-if="numerals">
      <text
        v-for="n in numeralPositions"
        :key="n.label"
        :x="n.x"
        :y="n.y"
        :fill="colors.ink"
        text-anchor="middle"
        dominant-baseline="central"
        class="font-sans"
        font-size="10.5"
        font-weight="500"
      >
        {{ n.label }}
      </text>
    </template>

    <g :style="handStyle(hourAngle)">
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="45"
        :stroke="colors.ink"
        stroke-width="1.6"
      />
      <line
        x1="50"
        y1="45"
        x2="50"
        y2="27"
        :stroke="colors.ink"
        stroke-width="4"
        stroke-linecap="round"
      />
    </g>
    <g :style="handStyle(minuteAngle)">
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="45"
        :stroke="colors.ink"
        stroke-width="1.6"
      />
      <line
        x1="50"
        y1="45"
        x2="50"
        y2="11"
        :stroke="colors.ink"
        stroke-width="3.2"
        stroke-linecap="round"
      />
    </g>
    <circle cx="50" cy="50" r="2.6" :fill="colors.ink" />
    <g v-if="showSeconds" :style="handStyle(secondAngle, true)">
      <line
        x1="50"
        y1="60"
        x2="50"
        y2="8"
        stroke="var(--accent)"
        stroke-width="0.9"
        stroke-linecap="round"
      />
      <circle cx="50" cy="50" r="1.9" fill="var(--accent)" />
    </g>
    <circle cx="50" cy="50" r="0.8" :fill="colors.face" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getTimeParts } from '~~/lib/time/format'

const props = withDefaults(
  defineProps<{
    date: Date
    timeZone?: string
    showSeconds?: boolean
    numerals?: boolean
    /** `auto` follows the card tone; `day`/`night` force a light/dark face. */
    face?: 'auto' | 'day' | 'night'
  }>(),
  { timeZone: undefined, showSeconds: true, numerals: true, face: 'auto' },
)

const colors = computed(() => {
  if (props.face === 'day') {
    return { face: '#ffffff', ink: '#0f1a2a', ring: 'rgb(15 26 42 / 0.12)' }
  }
  if (props.face === 'night') {
    return { face: '#05080d', ink: '#f4f7fb', ring: 'rgb(255 255 255 / 0.14)' }
  }
  return { face: 'var(--face)', ink: 'var(--face-ink)', ring: 'var(--line)' }
})

const parts = computed(() =>
  getTimeParts(props.date, { timeZone: props.timeZone }),
)

/**
 * Angles only ever increase (by adding a full turn when the raw angle
 * wraps), so the CSS transition never spins a hand backwards at :00.
 */
function continuousAngle(source: () => number) {
  let turns = 0
  let previous: number | null = null
  return computed(() => {
    const raw = source()
    if (previous !== null && raw < previous - 180) turns++
    previous = raw
    return raw + turns * 360
  })
}

const secondAngle = continuousAngle(() => Number(parts.value.seconds) * 6)
const minuteAngle = continuousAngle(
  () => (Number(parts.value.minutes) + Number(parts.value.seconds) / 60) * 6,
)
const hourAngle = continuousAngle(
  () =>
    ((Number(parts.value.hours) % 12) + Number(parts.value.minutes) / 60) * 30,
)

function handStyle(angle: number, springy = false) {
  return {
    transform: `rotate(${angle}deg)`,
    transformOrigin: '50px 50px',
    transformBox: 'view-box',
    transition: springy
      ? 'transform 0.35s cubic-bezier(0.4, 2.2, 0.55, 1)'
      : 'transform 0.5s ease-out',
  } as const
}

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: 50 + radius * Math.cos(rad), y: 50 + radius * Math.sin(rad) }
}

const ticks = Array.from({ length: 60 }, (_, i) => {
  const major = i % 5 === 0
  const outer = polar(i * 6, 46.5)
  const inner = polar(i * 6, major ? 43 : 44.5)
  return { i, major, x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y }
})

const numeralPositions = Array.from({ length: 12 }, (_, i) => {
  const point = polar((i + 1) * 30, 35)
  return { label: String(i + 1), ...point }
})
</script>
