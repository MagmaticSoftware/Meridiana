<template>
  <div
    class="flex h-full w-full flex-col items-center justify-center gap-[2cqh] [container-type:size]"
  >
    <ClientOnly>
      <span
        class="text-accent-400 font-display text-[min(8cqw,10cqh)] tracking-wide uppercase"
      >
        Today
      </span>
      <span
        class="font-display text-surface-50 text-[min(14cqw,16cqh)] leading-none font-light"
      >
        {{ weekdayDate }}
      </span>
      <span
        v-if="showWeekNumber"
        class="text-surface-400 text-[min(6cqw,8cqh)]"
      >
        Week {{ weekNumber }}
      </span>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '~/composables/useNow'
import { getIsoWeekNumber } from './dateUtils'

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

const now = useNow(60_000)

const weekdayDate = computed(() =>
  now.value.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  }),
)

const weekNumber = computed(() => getIsoWeekNumber(now.value))
</script>
