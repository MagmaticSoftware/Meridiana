<template>
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <defs>
      <linearGradient :id="`sun-${uid}`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffd76a" />
        <stop offset="100%" stop-color="#f68d42" />
      </linearGradient>
      <linearGradient :id="`cloud-${uid}`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#d5dde8" />
      </linearGradient>
    </defs>

    <!-- Sun or moon: alone when clear, peeking behind a cloud when
         partly cloudy. -->
    <g v-if="condition === 'clear' || condition === 'partly-cloudy'">
      <template v-if="isDay">
        <circle
          :cx="condition === 'clear' ? 24 : 17"
          :cy="condition === 'clear' ? 24 : 17"
          :r="condition === 'clear' ? 11 : 8.5"
          :fill="`url(#sun-${uid})`"
        />
        <g
          v-if="condition === 'clear'"
          stroke="#f9b45a"
          stroke-width="2.6"
          stroke-linecap="round"
        >
          <line
            v-for="i in 8"
            :key="i"
            :x1="24 + 15.5 * Math.cos((i * Math.PI) / 4)"
            :y1="24 + 15.5 * Math.sin((i * Math.PI) / 4)"
            :x2="24 + 19.5 * Math.cos((i * Math.PI) / 4)"
            :y2="24 + 19.5 * Math.sin((i * Math.PI) / 4)"
          />
        </g>
      </template>
      <path
        v-else
        :d="condition === 'clear' ? MOON : MOON_SMALL"
        fill="#f3e7b6"
      />
    </g>

    <path
      v-if="condition !== 'clear' && condition !== 'fog'"
      :d="condition === 'partly-cloudy' ? CLOUD_LOW : CLOUD_HIGH"
      :fill="`url(#cloud-${uid})`"
      :fill-opacity="condition === 'storm' ? 0.75 : 0.95"
    />

    <g
      v-if="condition === 'rain'"
      stroke="#5aa2d6"
      stroke-width="2.6"
      stroke-linecap="round"
    >
      <line x1="17" y1="35" x2="15" y2="41" />
      <line x1="25" y1="35" x2="23" y2="41" />
      <line x1="33" y1="35" x2="31" y2="41" />
    </g>

    <g v-else-if="condition === 'snow'" fill="#ffffff">
      <circle cx="16" cy="38" r="1.8" />
      <circle cx="24" cy="41" r="1.8" />
      <circle cx="32" cy="38" r="1.8" />
    </g>

    <path
      v-else-if="condition === 'storm'"
      d="M25.5 31 19 40h5l-2.5 7.5L30 37h-5l3-6z"
      fill="#f4d23c"
    />

    <g v-else-if="condition === 'fog'">
      <path :d="CLOUD_HIGH" :fill="`url(#cloud-${uid})`" fill-opacity="0.55" />
      <g stroke="#d5dde8" stroke-width="2.6" stroke-linecap="round">
        <line x1="10" y1="37" x2="34" y2="37" />
        <line x1="16" y1="43" x2="40" y2="43" />
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import type { WeatherCondition } from '~~/lib/weather/types'

withDefaults(
  defineProps<{
    condition: WeatherCondition
    isDay?: boolean
  }>(),
  { isDay: true },
)

const uid = useId()

const MOON = 'M30 8a14 14 0 1 0 10 24A12 12 0 0 1 30 8Z'
const MOON_SMALL = 'M20 6a10 10 0 1 0 8 17A9 9 0 0 1 20 6Z'
const CLOUD_LOW =
  'M15 39a8 8 0 0 1-.9-15.95A10.5 10.5 0 0 1 34.3 21.6 8.75 8.75 0 0 1 34 39H15Z'
const CLOUD_HIGH =
  'M14 32a8 8 0 0 1-.9-15.95A10.5 10.5 0 0 1 33.3 14.6 8.75 8.75 0 0 1 33 32H14Z'
</script>
