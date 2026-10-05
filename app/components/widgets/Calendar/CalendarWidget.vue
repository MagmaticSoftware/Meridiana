<template>
  <div
    class="flex h-full w-full flex-col [container-type:size]"
    :style="{ fontSize: unit }"
  >
    <header class="flex shrink-0 items-center justify-between pb-[0.5em]">
      <button
        type="button"
        class="text-ink truncate text-[1.2em] font-bold tracking-[-0.01em]"
        :title="offset !== 0 ? 'Back to today' : undefined"
        @click="offset = 0"
        @dblclick.stop
      >
        {{ title }}
      </button>
      <div class="text-accent flex shrink-0 gap-[0.2em]">
        <button
          type="button"
          class="ui-icon-button text-accent hover:text-accent h-[1.8em] w-[1.8em]"
          aria-label="Previous month"
          @click="go(-1)"
          @dblclick.stop
        >
          <AppIcon
            name="arrow-left"
            class="h-[1.1em] w-[1.1em]"
            :stroke-width="2"
          />
        </button>
        <button
          type="button"
          class="ui-icon-button text-accent hover:text-accent h-[1.8em] w-[1.8em]"
          aria-label="Next month"
          @click="go(1)"
          @dblclick.stop
        >
          <AppIcon
            name="arrow-right"
            class="h-[1.1em] w-[1.1em]"
            :stroke-width="2"
          />
        </button>
      </div>
    </header>

    <div
      class="text-ink-subtle grid shrink-0 pb-[0.3em] text-center text-[0.8em] font-medium"
      :style="columns"
    >
      <span v-if="showWeekNumbers" />
      <span v-for="label in weekdayLabels" :key="label">{{ label }}</span>
    </div>

    <div class="relative min-h-0 flex-1 overflow-hidden">
      <Transition :name="direction > 0 ? 'month-next' : 'month-prev'">
        <div
          :key="`${view.year}-${view.month}`"
          class="absolute inset-0 grid grid-rows-6"
        >
          <div
            v-for="week in weeks"
            :key="week.weekNumber"
            class="grid items-center text-center"
            :style="columns"
          >
            <span
              v-if="showWeekNumbers"
              class="text-ink-subtle text-[0.7em] font-medium tabular-nums"
            >
              {{ week.weekNumber }}
            </span>
            <span
              v-for="day in week.days"
              :key="day.date.getTime()"
              class="flex items-center justify-center"
            >
              <span
                class="flex aspect-square w-[1.95em] items-center justify-center rounded-full font-medium tabular-nums transition-colors"
                :class="dayClass(day)"
              >
                {{ day.day }}
              </span>
            </span>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useNow } from '~/composables/useNow'
import { buildMonthGrid, getWeekdayLabels } from '~~/lib/time/calendar'
import type { CalendarDay, WeekStart } from '~~/lib/time/calendar'

const props = withDefaults(
  defineProps<{
    size?: { w: number; h: number }
    weekStart?: WeekStart
    showWeekNumbers?: boolean
    highlightWeekends?: boolean
  }>(),
  {
    size: () => ({ w: 2, h: 2 }),
    weekStart: 'monday',
    showWeekNumbers: false,
    highlightWeekends: false,
  },
)

/** Browsing other months snaps back to today after this long. */
const RETURN_TO_TODAY_MS = 60_000

const now = useNow('minute')
const offset = ref(0)
const direction = ref(1)
let returnTimer: ReturnType<typeof setTimeout> | undefined

function go(delta: number) {
  offset.value += delta
}

watch(offset, (value, previous) => {
  direction.value = value > previous ? 1 : -1
  clearTimeout(returnTimer)
  if (value !== 0) {
    returnTimer = setTimeout(() => (offset.value = 0), RETURN_TO_TODAY_MS)
  }
})

onUnmounted(() => clearTimeout(returnTimer))

const view = computed(() => {
  const first = new Date(
    now.value.getFullYear(),
    now.value.getMonth() + offset.value,
    1,
  )
  return { year: first.getFullYear(), month: first.getMonth(), first }
})

const title = computed(() =>
  view.value.first.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  }),
)

const weeks = computed(() =>
  buildMonthGrid(view.value.year, view.value.month, props.weekStart, now.value),
)

const weekdayLabels = computed(() => getWeekdayLabels(props.weekStart))

const columns = computed(() => ({
  gridTemplateColumns: props.showWeekNumbers
    ? '0.7fr repeat(7, minmax(0, 1fr))'
    : 'repeat(7, minmax(0, 1fr))',
}))

// One font-size drives the whole layout: 7–8 columns wide, ~8.5 rows tall.
const unit = computed(() =>
  props.showWeekNumbers ? 'min(4.3cqw, 6.6cqh)' : 'min(4.9cqw, 6.6cqh)',
)

function dayClass(day: CalendarDay) {
  if (day.isToday) {
    return 'bg-accent text-accent-ink font-semibold shadow-[0_0.2em_0.6em_-0.1em_var(--accent)]'
  }
  if (day.isMonthStart) return 'text-accent'
  if (!day.inMonth) return 'text-ink-subtle'
  if (props.highlightWeekends && day.isWeekend) return 'text-ink-muted'
  return 'text-ink'
}
</script>

<style scoped>
.month-next-enter-active,
.month-next-leave-active,
.month-prev-enter-active,
.month-prev-leave-active {
  transition:
    transform 0.35s var(--ease-out-soft),
    opacity 0.35s var(--ease-out-soft);
}
.month-next-enter-from,
.month-prev-leave-to {
  transform: translateX(12%);
  opacity: 0;
}
.month-next-leave-to,
.month-prev-enter-from {
  transform: translateX(-12%);
  opacity: 0;
}
</style>
