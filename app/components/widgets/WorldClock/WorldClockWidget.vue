<template>
  <div
    class="flex h-full w-full flex-col justify-center gap-[3cqh] px-[8cqw] [container-type:size]"
  >
    <ClientOnly>
      <div
        v-for="city in cities"
        :key="city.timeZone"
        class="flex items-baseline justify-between"
      >
        <span class="text-surface-300 text-[min(7cqw,9cqh)]">{{
          city.label
        }}</span>
        <span
          class="font-display text-surface-50 text-[min(9cqw,11cqh)] tabular-nums"
        >
          {{ timeFor(city.timeZone) }}
        </span>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useNow } from '~/composables/useNow'
import { defaultCities } from './types'
import type { WorldClockCity } from './types'

withDefaults(
  defineProps<{
    size?: { w: number; h: number }
    cities?: WorldClockCity[]
  }>(),
  {
    size: () => ({ w: 1, h: 1 }),
    cities: () => defaultCities,
  },
)

const now = useNow(30_000)

function timeFor(timeZone: string) {
  return now.value.toLocaleTimeString(undefined, {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
