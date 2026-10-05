<template>
  <div class="h-full w-full [container-type:size]">
    <p
      v-if="times.length === 0"
      class="text-ink-muted flex h-full items-center justify-center text-center text-sm"
    >
      Pick some cities in the widget settings.
    </p>

    <!-- List: city + relative day on the left, big time on the right. -->
    <ul
      v-else-if="variant === 'list'"
      class="divide-line flex h-full flex-col justify-center divide-y"
      :style="{ fontSize: `min(13cqw, ${(62 / times.length).toFixed(2)}cqh)` }"
    >
      <li
        v-for="t in times"
        :key="t.city.id"
        class="flex min-h-0 flex-1 items-center justify-between gap-[0.4em]"
      >
        <div class="min-w-0">
          <p
            class="text-ink truncate text-[0.38em] leading-tight font-semibold"
          >
            {{ t.city.name }}
          </p>
          <p class="text-ink-muted truncate text-[0.28em] leading-tight">
            {{ t.dayLabel }}, {{ t.offsetLabel }}
          </p>
        </div>
        <p
          class="font-display text-ink shrink-0 leading-none font-light tracking-[-0.02em] whitespace-nowrap tabular-nums"
        >
          {{ t.parts.hours }}:{{ t.parts.minutes
          }}<span
            v-if="t.parts.period"
            class="text-ink-muted ml-[0.1em] text-[0.32em] font-medium tracking-normal"
            >{{ t.parts.period }}</span
          >
        </p>
      </li>
    </ul>

    <!-- Tiles: one rounded tile per city, darker at night. -->
    <div
      v-else-if="variant === 'tiles'"
      class="grid h-full gap-[clamp(6px,2.5cqmin,14px)]"
      :style="gridStyle(1.7)"
    >
      <div
        v-for="t in times"
        :key="t.city.id"
        class="relative min-h-0 overflow-hidden rounded-[clamp(10px,4cqmin,20px)] [container-type:size]"
        :class="t.night ? 'bg-night text-white' : 'bg-tint-strong text-ink'"
      >
        <div class="flex h-full flex-col justify-between p-[max(8px,8cqmin)]">
          <div class="leading-tight">
            <p class="text-[min(12cqw,17cqh)] font-bold tracking-wide">
              {{ t.city.code }}
            </p>
            <p class="text-[min(8cqw,11cqh)] font-medium opacity-60">
              {{ t.dateLabel }}
            </p>
          </div>
          <p
            class="font-display self-end text-[min(26cqw,44cqh)] leading-none font-light tracking-[-0.02em] whitespace-nowrap tabular-nums"
          >
            {{ t.parts.hours }}:{{ t.parts.minutes
            }}<span
              v-if="t.parts.period"
              class="ml-[0.05em] text-[0.4em] font-medium opacity-70"
              >{{ t.parts.period.charAt(0) }}</span
            >
          </p>
        </div>
      </div>
    </div>

    <!-- Analog: a row of dials, white by day and black by night. -->
    <div
      v-else-if="variant === 'analog'"
      class="grid h-full"
      :style="gridStyle(0.8)"
    >
      <div
        v-for="t in times"
        :key="t.city.id"
        class="flex min-h-0 flex-col items-center justify-center gap-[5cqh] [container-type:size]"
      >
        <AnalogFace
          :date="now"
          :time-zone="t.city.timeZone"
          :face="t.night ? 'night' : 'day'"
          class="aspect-square h-[min(64cqh,84cqw)]"
        />
        <div class="w-full text-center leading-tight">
          <p class="text-ink truncate text-[min(9cqw,9cqh)] font-semibold">
            {{ t.city.name }}
          </p>
          <p class="text-ink-muted truncate text-[min(7.5cqw,7.5cqh)]">
            {{ t.dayLabel }}, {{ t.offsetLabel }}
          </p>
        </div>
      </div>
    </div>

    <WorldMap v-else :times="times" :now="now" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '~/composables/useNow'
import { resolveCities } from '~~/lib/time/cities'
import { bestColumns, describeCityTime } from './cityTime'
import type { WorldClockStyle } from './cityTime'

const props = withDefaults(
  defineProps<{
    size?: { w: number; h: number }
    variant?: WorldClockStyle
    cities?: string[]
    hour12?: boolean
  }>(),
  {
    size: () => ({ w: 2, h: 2 }),
    variant: 'list',
    cities: () => ['new-york', 'london', 'tokyo', 'sydney'],
    hour12: false,
  },
)

const now = useNow()

const times = computed(() =>
  resolveCities(props.cities).map((city) =>
    describeCityTime(city, now.value, props.hour12),
  ),
)

function gridStyle(targetAspect: number) {
  const cols = bestColumns(times.value.length, props.size, targetAspect)
  const rows = Math.ceil(times.value.length / cols)
  return {
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
  }
}
</script>
