<template>
  <div
    class="flex h-full w-full flex-col justify-between [container-type:size]"
    :style="{ fontSize: 'min(9cqw, 12cqh)' }"
  >
    <div class="flex items-center justify-between">
      <span class="text-ink-muted text-[0.85em] font-medium">{{
        todayLabel
      }}</span>
      <span
        class="bg-accent/15 text-accent flex h-[1.7em] w-[1.7em] items-center justify-center rounded-full"
      >
        <AppIcon
          name="calendar-day"
          class="h-[0.95em] w-[0.95em]"
          :stroke-width="2"
        />
      </span>
    </div>

    <div class="min-w-0">
      <p
        class="font-display text-ink text-[1.75em] leading-[1.05] font-semibold tracking-[-0.02em]"
      >
        {{ weekday }},
        <br />
        {{ dayMonth }}
      </p>
    </div>

    <div class="flex flex-wrap gap-[0.35em] text-[0.75em] font-medium">
      <span
        v-if="showWeekNumber"
        class="bg-tint-strong text-ink rounded-full px-[0.7em] py-[0.25em]"
      >
        Week {{ weekNumber }}
      </span>
      <span
        class="bg-tint-strong text-ink rounded-full px-[0.7em] py-[0.25em] tabular-nums"
      >
        {{ now.getFullYear() }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '~/composables/useNow'
import { getIsoWeekNumber } from '~~/lib/time/calendar'

withDefaults(
  defineProps<{
    size?: { w: number; h: number }
    showWeekNumber?: boolean
  }>(),
  {
    size: () => ({ w: 1, h: 1 }),
    showWeekNumber: true,
  },
)

const now = useNow('minute')

const todayLabel = (() => {
  const label = new Intl.RelativeTimeFormat(undefined, {
    numeric: 'auto',
  }).format(0, 'day')
  return label.charAt(0).toUpperCase() + label.slice(1)
})()

const weekday = computed(() =>
  now.value.toLocaleDateString(undefined, { weekday: 'short' }),
)
const dayMonth = computed(() =>
  now.value.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }),
)
const weekNumber = computed(() => getIsoWeekNumber(now.value))
</script>
