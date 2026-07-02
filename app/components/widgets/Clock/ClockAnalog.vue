<template>
  <div class="flex h-full w-full items-center justify-center p-[8%]">
    <svg viewBox="0 0 100 100" class="h-full max-h-full w-full max-w-full">
      <circle
        cx="50"
        cy="50"
        r="48"
        class="stroke-surface-700 fill-none"
        stroke-width="1.5"
      />
      <line
        v-for="tick in ticks"
        :key="tick.i"
        :x1="tick.x1"
        :y1="tick.y1"
        :x2="tick.x2"
        :y2="tick.y2"
        class="stroke-surface-600"
        stroke-width="1"
        stroke-linecap="round"
      />
      <line
        :x1="50"
        :y1="50"
        :x2="hourHand.x"
        :y2="hourHand.y"
        class="stroke-surface-50 transition-all duration-200 ease-out"
        stroke-width="3"
        stroke-linecap="round"
      />
      <line
        :x1="50"
        :y1="50"
        :x2="minuteHand.x"
        :y2="minuteHand.y"
        class="stroke-surface-50 transition-all duration-200 ease-out"
        stroke-width="2"
        stroke-linecap="round"
      />
      <line
        :x1="50"
        :y1="50"
        :x2="secondHand.x"
        :y2="secondHand.y"
        class="stroke-accent-400 transition-all duration-200 ease-out"
        stroke-width="1"
        stroke-linecap="round"
      />
      <circle cx="50" cy="50" r="2" class="fill-accent-400" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '~/composables/useNow'

const now = useNow(1000)

function handPoint(angleDeg: number, length: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: 50 + length * Math.cos(rad), y: 50 + length * Math.sin(rad) }
}

const hourHand = computed(() => {
  const h = now.value.getHours() % 12
  const m = now.value.getMinutes()
  return handPoint((h + m / 60) * 30, 25)
})

const minuteHand = computed(() => {
  const m = now.value.getMinutes()
  const s = now.value.getSeconds()
  return handPoint((m + s / 60) * 6, 36)
})

const secondHand = computed(() => {
  const s = now.value.getSeconds()
  return handPoint(s * 6, 40)
})

const ticks = computed(() =>
  Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30
    const outer = handPoint(angle, 46)
    const inner = handPoint(angle, 41)
    return { i, x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y }
  }),
)
</script>
