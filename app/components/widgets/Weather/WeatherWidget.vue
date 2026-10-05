<template>
  <div
    class="flex h-full w-full flex-col justify-between [container-type:size]"
    :style="{ fontSize: 'min(9cqw, 11cqh)' }"
  >
    <template v-if="data">
      <div class="flex items-start justify-between gap-[0.5em]">
        <div class="min-w-0 leading-tight">
          <p class="text-ink truncate font-semibold">
            {{ data.locationName }}
          </p>
          <p class="text-ink-muted truncate text-[0.8em]">
            {{ conditionLabels[data.condition] }}
            <span v-if="stale" :title="error ?? undefined"> · offline</span>
          </p>
        </div>
        <WeatherIcon
          :condition="data.condition"
          :is-day="data.isDay"
          class="h-[2.6em] w-[2.6em] shrink-0"
        />
      </div>
      <div class="flex items-end justify-between gap-[0.5em]">
        <p
          class="font-display text-ink text-[min(36cqw,48cqh)] leading-[0.9] font-light tracking-[-0.04em] tabular-nums"
        >
          {{ format(data.temperatureC) }}<span class="text-ink-muted">°</span>
        </p>
        <p
          class="text-ink-muted shrink-0 pb-[0.15em] text-right text-[0.8em] leading-tight tabular-nums"
        >
          <span class="text-ink font-medium">↑ {{ format(data.highC) }}°</span>
          <br />
          ↓ {{ format(data.lowC) }}°
        </p>
      </div>
    </template>

    <div
      v-else
      class="text-ink-muted flex h-full flex-col items-center justify-center gap-[0.4em] text-center text-[0.8em]"
    >
      <WeatherIcon condition="cloudy" class="h-[2.4em] w-[2.4em] opacity-40" />
      <p>{{ error ?? 'Loading weather…' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWeather } from '~/composables/useWeather'
import type { WeatherCondition } from '~~/lib/weather/types'

const props = withDefaults(
  defineProps<{
    size?: { w: number; h: number }
    location?: string
    useDeviceLocation?: boolean
    unit?: 'C' | 'F'
  }>(),
  {
    size: () => ({ w: 1, h: 1 }),
    location: 'Milan',
    useDeviceLocation: false,
    unit: 'C',
  },
)

const conditionLabels: Record<WeatherCondition, string> = {
  clear: 'Clear',
  'partly-cloudy': 'Partly cloudy',
  cloudy: 'Cloudy',
  rain: 'Rain',
  snow: 'Snow',
  storm: 'Thunderstorm',
  fog: 'Fog',
}

const { data, error, stale } = useWeather(() => ({
  location: props.location,
  useDeviceLocation: props.useDeviceLocation,
}))

function format(celsius: number) {
  return Math.round(props.unit === 'F' ? (celsius * 9) / 5 + 32 : celsius)
}
</script>
