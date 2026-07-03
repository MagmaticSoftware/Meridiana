<template>
  <svg viewBox="0 0 24 24" class="h-full w-full" fill="none">
    <template v-if="condition === 'clear'">
      <circle
        cx="12"
        cy="12"
        r="5"
        class="stroke-accent-300"
        stroke-width="1.5"
      />
      <g class="stroke-accent-300" stroke-width="1.5" stroke-linecap="round">
        <line x1="12" y1="1.5" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22.5" />
        <line x1="1.5" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22.5" y2="12" />
        <line x1="4.5" y1="4.5" x2="6.2" y2="6.2" />
        <line x1="17.8" y1="17.8" x2="19.5" y2="19.5" />
        <line x1="19.5" y1="4.5" x2="17.8" y2="6.2" />
        <line x1="6.2" y1="17.8" x2="4.5" y2="19.5" />
      </g>
    </template>
    <template v-else-if="condition === 'cloudy'">
      <path
        d="M7 17a4.5 4.5 0 0 1-.5-8.97A5 5 0 0 1 16.2 8.5 4 4 0 0 1 16 17H7Z"
        class="stroke-surface-300"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
    </template>
    <template v-else-if="condition === 'rain'">
      <path
        d="M7 14a4 4 0 0 1-.4-7.98A4.5 4.5 0 0 1 15.2 5.5 3.5 3.5 0 0 1 15 14H7Z"
        class="stroke-surface-300"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <g class="stroke-accent-300" stroke-width="1.5" stroke-linecap="round">
        <line x1="8" y1="18" x2="7" y2="21" />
        <line x1="12" y1="18" x2="11" y2="21" />
        <line x1="16" y1="18" x2="15" y2="21" />
      </g>
    </template>
    <template v-else-if="condition === 'snow'">
      <path
        d="M7 14a4 4 0 0 1-.4-7.98A4.5 4.5 0 0 1 15.2 5.5 3.5 3.5 0 0 1 15 14H7Z"
        class="stroke-surface-300"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <g class="stroke-accent-300" stroke-width="1.5" stroke-linecap="round">
        <circle cx="8" cy="19" r="0.6" fill="currentColor" />
        <circle cx="12" cy="20" r="0.6" fill="currentColor" />
        <circle cx="16" cy="19" r="0.6" fill="currentColor" />
      </g>
    </template>
    <template v-else-if="condition === 'storm'">
      <path
        d="M7 13a4 4 0 0 1-.4-7.98A4.5 4.5 0 0 1 15.2 4.5 3.5 3.5 0 0 1 15 13H7Z"
        class="stroke-surface-300"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <path
        d="m12.5 14-3 5h2.5l-1.5 4 4.5-6h-2.5z"
        class="stroke-accent-300"
        stroke-width="1.2"
        stroke-linejoin="round"
      />
    </template>
    <template v-else>
      <g class="stroke-surface-400" stroke-width="1.5" stroke-linecap="round">
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="13" x2="20" y2="13" />
        <line x1="4" y1="17" x2="16" y2="17" />
      </g>
    </template>
  </svg>
</template>

<script setup lang="ts">
import type { WeatherCondition } from '~~/lib/weather/types'

defineProps<{
  condition: WeatherCondition
}>()
</script>
