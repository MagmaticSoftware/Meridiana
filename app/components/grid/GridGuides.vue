<template>
  <!-- One overlay for the whole grid: crosses where block lines meet,
       dots at the half-block steps widgets can also snap to. -->
  <svg
    ref="el"
    class="text-ink pointer-events-none h-full w-full overflow-visible"
    aria-hidden="true"
  >
    <g stroke-linecap="round">
      <path
        :d="crosses"
        stroke="currentColor"
        stroke-opacity="0.6"
        stroke-width="1.75"
      />
      <path
        :d="dots"
        stroke="currentColor"
        stroke-opacity="0.45"
        stroke-width="3.5"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { MIN_SPAN } from '~~/lib/grid/config'

const props = defineProps<{
  columns: number
  rows: number
  /** Column/row gap in px. */
  gap: number
}>()

const CROSS = 7 // half-length of a cross arm, px

const el = ref<SVGSVGElement | null>(null)
const size = ref({ width: 0, height: 0 })
let observer: ResizeObserver | undefined

onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    if (entry) {
      size.value = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }
    }
  })
  if (el.value) observer.observe(el.value)
})

onUnmounted(() => observer?.disconnect())

/**
 * Positions of the n+1 grid lines along one axis: the outer edges, and
 * the middle of each gap in between.
 */
function lines(count: number, length: number): number[] {
  const step = (length + props.gap) / count
  return Array.from({ length: count + 1 }, (_, i) =>
    i === 0 ? 0 : i === count ? length : i * step - props.gap / 2,
  )
}

const intersections = computed(() => {
  const { width, height } = size.value
  if (!width || !height) return []
  const xs = lines(props.columns, width)
  const ys = lines(props.rows, height)
  return ys.flatMap((y, row) =>
    xs.map((x, col) => ({
      x,
      y,
      major: row % MIN_SPAN === 0 && col % MIN_SPAN === 0,
    })),
  )
})

const crosses = computed(() =>
  intersections.value
    .filter((p) => p.major)
    .map(
      (p) =>
        `M${p.x - CROSS} ${p.y}h${CROSS * 2}M${p.x} ${p.y - CROSS}v${CROSS * 2}`,
    )
    .join(''),
)

// A zero-length round-capped segment renders as a dot.
const dots = computed(() =>
  intersections.value
    .filter((p) => !p.major)
    .map((p) => `M${p.x} ${p.y}h0`)
    .join(''),
)
</script>
