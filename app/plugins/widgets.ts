import { registerWidget } from '~~/lib/widgets/registry'
import ClockWidget from '~/components/widgets/Clock/ClockWidget.vue'
import DateWidget from '~/components/widgets/Date/DateWidget.vue'
import WorldClockWidget from '~/components/widgets/WorldClock/WorldClockWidget.vue'
import WeatherWidget from '~/components/widgets/Weather/WeatherWidget.vue'
import ChecklistWidget from '~/components/widgets/Checklist/ChecklistWidget.vue'

export default defineNuxtPlugin(() => {
  registerWidget({
    id: 'clock',
    name: 'Clock',
    description: 'Displays the current time in flip, minimal or analog style.',
    component: ClockWidget,
    category: 'time',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 3, h: 3 },
    settingsSchema: [
      {
        key: 'variant',
        label: 'Style',
        type: 'select',
        default: 'minimal',
        options: [
          { label: 'Minimal', value: 'minimal' },
          { label: 'Flip', value: 'flip' },
          { label: 'Analog', value: 'analog' },
        ],
      },
      {
        key: 'hour12',
        label: '12-hour format',
        type: 'boolean',
        default: false,
      },
      {
        key: 'showSeconds',
        label: 'Show seconds',
        type: 'boolean',
        default: true,
      },
    ],
  })

  registerWidget({
    id: 'date',
    name: 'Date',
    description: 'Today, weekday, date and week number.',
    component: DateWidget,
    category: 'time',
    defaultSize: { w: 2, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 3, h: 2 },
    settingsSchema: [
      {
        key: 'showWeekNumber',
        label: 'Show week number',
        type: 'boolean',
        default: true,
      },
    ],
  })

  registerWidget({
    id: 'world-clock',
    name: 'World Clock',
    description: 'Current time in a configurable list of cities.',
    component: WorldClockWidget,
    category: 'time',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 3, h: 3 },
    settingsSchema: [],
  })

  registerWidget({
    id: 'weather',
    name: 'Weather',
    description: 'Current conditions for a location (mock data for now).',
    component: WeatherWidget,
    category: 'weather',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 3, h: 3 },
    settingsSchema: [
      {
        key: 'location',
        label: 'Location',
        type: 'string',
        default: 'Milan',
      },
      {
        key: 'unit',
        label: 'Unit',
        type: 'select',
        default: 'C',
        options: [
          { label: 'Celsius', value: 'C' },
          { label: 'Fahrenheit', value: 'F' },
        ],
      },
    ],
  })

  registerWidget({
    id: 'checklist',
    name: 'Checklist',
    description: 'A simple todo list.',
    component: ChecklistWidget,
    category: 'productivity',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 3, h: 3 },
    settingsSchema: [],
  })
})
