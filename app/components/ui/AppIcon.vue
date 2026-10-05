<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="(d, i) in paths" :key="i" :d="d" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// A small, consistent stroke icon set (24px grid, 1.75 stroke) so every
// control in the app shares the same visual weight.
const icons: Record<string, string[]> = {
  plus: ['M12 5v14', 'M5 12h14'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  check: ['m5 12.5 4.5 4.5L19 7.5'],
  edit: [
    'M4 20l1-4.5L16.5 4a1.6 1.6 0 0 1 2.3 0l1.2 1.2a1.6 1.6 0 0 1 0 2.3L8.5 19 4 20Z',
  ],
  settings: [
    'M4 7h10',
    'M18 7h2',
    'M4 17h2',
    'M10 17h10',
    'M16 5v4',
    'M8 15v4',
  ],
  expand: [
    'M9 4H5a1 1 0 0 0-1 1v4',
    'M15 4h4a1 1 0 0 1 1 1v4',
    'M9 20H5a1 1 0 0 1-1-1v-4',
    'M15 20h4a1 1 0 0 0 1-1v-4',
  ],
  move: [
    'M12 3v18',
    'M3 12h18',
    'm9 6 3-3 3 3',
    'm9 18 3 3 3-3',
    'm6 9-3 3 3 3',
    'm18 9 3 3-3 3',
  ],
  phone: [
    'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z',
    'M11 18h2',
  ],
  tablet: [
    'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z',
    'M11 18h2',
  ],
  desktop: [
    'M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z',
    'M9 20h6',
    'M12 16v4',
  ],
  resize: ['M19 9v10H9', 'M19 19 10 10'],
  trash: [
    'M5 7h14',
    'M10 11v6',
    'M14 11v6',
    'M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12',
    'M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
  ],
  'arrow-left': ['M19 12H5', 'm11 6-6 6 6 6'],
  'arrow-right': ['M5 12h14', 'm13 6 6 6-6 6'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5l3 2'],
  calendar: [
    'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
    'M4 10h16',
    'M8 3v4',
    'M16 3v4',
  ],
  'calendar-day': [
    'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
    'M4 10h16',
    'M8 3v4',
    'M16 3v4',
    'M12 14h.01',
  ],
  globe: [
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
    'M3 12h18',
    'M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z',
  ],
  weather: [
    'M8 5V3',
    'M3.5 9H2',
    'M4.8 5.8 3.8 4.8',
    'M12.2 5.8l1-1',
    'M5.2 11.6A4 4 0 1 1 12 7.4',
    'M9 20a4 4 0 1 1 .6-7.95A5 5 0 0 1 19 13.5a3.25 3.25 0 0 1-.5 6.5H9Z',
  ],
  checklist: [
    'm4 6.5 1.5 1.5L8 5.5',
    'm4 12.5 1.5 1.5L8 11.5',
    'M4.5 18h3',
    'M11 7h9',
    'M11 13h9',
    'M11 18h9',
  ],
  palette: [
    'M12 21a9 9 0 1 1 9-9c0 2.2-1.8 3-3.5 3H15a2 2 0 0 0-1.4 3.4c.6.6.4 2.6-1.6 2.6Z',
    'M7.5 11h.01',
    'M10.5 7.5h.01',
    'M15 8h.01',
  ],
  image: [
    'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z',
    'm4 16 5-5 4 4 2-2 5 5',
    'M15.5 8.5h.01',
  ],
  upload: [
    'M12 15V4',
    'm7 9 5-5 5 5',
    'M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3',
  ],
  download: [
    'M12 4v11',
    'm7 10 5 5 5-5',
    'M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3',
  ],
  reset: ['M4 12a8 8 0 1 0 2.4-5.7', 'M4 4v4h4'],
  sunrise: [
    'M12 3v4',
    'm9 5 3-2 3 2',
    'M4.9 12.9l1.4 1.4',
    'M2 19h2',
    'M20 19h2',
    'M17.7 14.3l1.4-1.4',
    'M22 22H2',
    'M8 19a4 4 0 0 1 8 0',
  ],
  sunset: [
    'M12 7V3',
    'm15 5-3 2-3-2',
    'M4.9 12.9l1.4 1.4',
    'M2 19h2',
    'M20 19h2',
    'M17.7 14.3l1.4-1.4',
    'M22 22H2',
    'M8 19a4 4 0 0 1 8 0',
  ],
  layout: ['M4 4h7v9H4z', 'M13 4h7v5h-7z', 'M13 11h7v9h-7z', 'M4 15h7v5H4z'],
}

const props = withDefaults(
  defineProps<{ name: string; strokeWidth?: number }>(),
  { strokeWidth: 1.75 },
)

const paths = computed(() => icons[props.name] ?? [])
</script>
