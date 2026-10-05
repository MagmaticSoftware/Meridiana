<template>
  <svg
    :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
    preserveAspectRatio="xMidYMid meet"
    class="block h-full w-full"
    role="img"
    aria-label="World map with day and night"
  >
    <defs>
      <radialGradient :id="glowId">
        <stop offset="0%" stop-color="#ffc35c" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#ffc35c" stop-opacity="0" />
      </radialGradient>
      <!-- `meet` letterboxes the map, so keep shading inside its bounds. -->
      <clipPath :id="clipId">
        <rect x="0" y="0" :width="WIDTH" :height="HEIGHT" />
      </clipPath>
    </defs>

    <!-- Land, as a grid of dots: one static path instead of thousands of
         circles, so the per-second re-render stays cheap. -->
    <path :d="DOTS_PATH" class="fill-ink-subtle" />

    <g :clip-path="`url(#${clipId})`">
      <circle :cx="sun.x" :cy="sun.y" r="9" :fill="`url(#${glowId})`" />
      <path
        :d="nightPath"
        class="fill-night"
        fill-opacity="var(--map-night-opacity)"
      />
    </g>

    <g v-for="label in labels" :key="label.id">
      <circle
        :cx="label.x"
        :cy="label.y"
        r="1.5"
        fill="var(--accent)"
        :stroke="label.night ? '#05080d' : '#ffffff'"
        stroke-width="0.5"
      />
      <text
        :x="label.x + (label.flip ? -2.6 : 2.6)"
        :y="label.y - 0.6"
        :text-anchor="label.flip ? 'end' : 'start'"
        class="fill-ink font-sans"
        font-size="3"
        font-weight="700"
      >
        {{ label.code }}
      </text>
      <text
        :x="label.x + (label.flip ? -2.6 : 2.6)"
        :y="label.y + 2.6"
        :text-anchor="label.flip ? 'end' : 'start'"
        class="fill-ink-muted font-sans"
        font-size="2.6"
        font-weight="500"
      >
        {{ label.time }}
      </text>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { WORLD_DOTS } from '~~/lib/geo/worldDots'
import { getSubsolarPoint, getTerminator } from '~~/lib/time/sun'
import type { CityTime } from './cityTime'

const props = defineProps<{
  times: CityTime[]
  now: Date
}>()

const uid = useId()
const clipId = `map-clip-${uid}`
const glowId = `sun-glow-${uid}`

const { step, latTop, latBottom, lonLeft, cols, rows } = WORLD_DOTS
const WIDTH = cols
const HEIGHT = (latTop - latBottom) / step + 1

function project(lon: number, lat: number) {
  return { x: (lon - lonLeft) / step, y: (latTop - lat) / step + 0.5 }
}

const DOT_RADIUS = 0.62

const DOTS_PATH = rows
  .flatMap((row, r) =>
    row.split('').flatMap((hex, i) => {
      const nibble = parseInt(hex, 16)
      return [0, 1, 2, 3]
        .filter((bit) => nibble & (8 >> bit))
        .map((bit) => {
          const x = i * 4 + bit + 0.5 - DOT_RADIUS
          const y = r + 0.5
          const d = DOT_RADIUS * 2
          return `M${x} ${y}a${DOT_RADIUS} ${DOT_RADIUS} 0 1 0 ${d} 0a${DOT_RADIUS} ${DOT_RADIUS} 0 1 0 ${-d} 0`
        })
    }),
  )
  .join('')

// The terminator moves ~0.25°/min — recompute once a minute, not per second.
const minute = computed(() => Math.floor(props.now.getTime() / 60_000))

const nightPath = computed(() => {
  const date = new Date(minute.value * 60_000)
  const { points, darkPole } = getTerminator(date, 3)
  const edge = darkPole === 'south' ? HEIGHT + 2 : -2
  const line = points
    .map((p) => project(p.lon, p.lat))
    .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join('')
  return `${line}L${WIDTH},${edge}L0,${edge}Z`
})

const sun = computed(() => {
  const point = getSubsolarPoint(new Date(minute.value * 60_000))
  return project(point.lon, point.lat)
})

const labels = computed(() =>
  props.times.map((t) => {
    const point = project(t.city.lon, t.city.lat)
    return {
      id: t.city.id,
      code: t.city.code,
      time: `${t.parts.hours}:${t.parts.minutes}${t.parts.period ? ` ${t.parts.period}` : ''}`,
      night: t.night,
      flip: point.x > WIDTH - 22,
      ...point,
    }
  }),
)
</script>
