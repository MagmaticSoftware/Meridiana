<template>
  <div
    class="flex h-full w-full flex-col items-center justify-center gap-[2cqh] [container-type:size]"
  >
    <ClientOnly>
      <template v-if="data">
        <div class="h-[24cqh] w-[24cqh]">
          <WeatherIcon :condition="data.condition" />
        </div>
        <span
          class="font-display text-surface-50 text-[min(16cqw,20cqh)] leading-none font-light"
        >
          {{ displayTemperature }}
        </span>
        <span class="text-surface-400 text-[min(6cqw,8cqh)]">
          {{ data.locationName }}
        </span>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWeather } from '~/composables/useWeather'

const props = withDefaults(
  defineProps<{
    size?: { w: number; h: number }
    location?: string
    unit?: 'C' | 'F'
  }>(),
  {
    size: () => ({ w: 1, h: 1 }),
    location: 'Milan',
    unit: 'C',
  },
)

const { data } = useWeather(() => props.location)

const displayTemperature = computed(() => {
  if (!data.value) return ''
  const celsius = data.value.temperatureC
  const value =
    props.unit === 'F'
      ? Math.round((celsius * 9) / 5 + 32)
      : Math.round(celsius)
  return `${value}°${props.unit}`
})
</script>
