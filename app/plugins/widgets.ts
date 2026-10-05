import { registerWidget } from '~~/lib/widgets/registry'
import { cities } from '~~/lib/time/cities'
import ClockWidget from '~/components/widgets/Clock/ClockWidget.vue'
import DateWidget from '~/components/widgets/Date/DateWidget.vue'
import CalendarWidget from '~/components/widgets/Calendar/CalendarWidget.vue'
import WorldClockWidget from '~/components/widgets/WorldClock/WorldClockWidget.vue'
import WeatherWidget from '~/components/widgets/Weather/WeatherWidget.vue'
import ChecklistWidget from '~/components/widgets/Checklist/ChecklistWidget.vue'

const hour12Field = {
  key: 'hour12',
  label: '12-hour format',
  type: 'boolean',
  default: false,
} as const

export default defineNuxtPlugin(() => {
  registerWidget({
    id: 'clock',
    name: 'Clock',
    description: 'The current time, in six digital and analog styles.',
    component: ClockWidget,
    category: 'time',
    icon: 'clock',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 12, h: 8 },
    settingsSchema: [
      {
        key: 'variant',
        label: 'Style',
        type: 'select',
        default: 'minimal',
        options: [
          { label: 'Minimal', value: 'minimal' },
          { label: 'Bold', value: 'bold' },
          { label: 'Stacked', value: 'stacked' },
          { label: 'Condensed', value: 'condensed' },
          { label: 'Flip', value: 'flip' },
          { label: 'Analog', value: 'analog' },
        ],
      },
      hour12Field,
      {
        key: 'showSeconds',
        label: 'Show seconds',
        type: 'boolean',
        default: true,
      },
      {
        key: 'showDate',
        label: 'Show date',
        type: 'boolean',
        default: false,
      },
    ],
  })

  registerWidget({
    id: 'calendar',
    name: 'Calendar',
    description: 'A month at a glance, with today highlighted.',
    component: CalendarWidget,
    category: 'time',
    icon: 'calendar',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 8, h: 8 },
    settingsSchema: [
      {
        key: 'weekStart',
        label: 'Week starts on',
        type: 'select',
        default: 'monday',
        options: [
          { label: 'Monday', value: 'monday' },
          { label: 'Sunday', value: 'sunday' },
        ],
      },
      {
        key: 'showWeekNumbers',
        label: 'Show week numbers',
        type: 'boolean',
        default: false,
      },
      {
        key: 'highlightWeekends',
        label: 'Dim weekends',
        type: 'boolean',
        default: false,
      },
    ],
  })

  registerWidget({
    id: 'date',
    name: 'Date',
    description: 'Today’s weekday, date and week number.',
    component: DateWidget,
    category: 'time',
    icon: 'calendar-day',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 6, h: 4 },
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
    description: 'Time around the world as a list, tiles, dials or a map.',
    component: WorldClockWidget,
    category: 'time',
    icon: 'globe',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 12, h: 8 },
    settingsSchema: [
      {
        key: 'variant',
        label: 'Style',
        type: 'select',
        default: 'list',
        options: [
          { label: 'List', value: 'list' },
          { label: 'Tiles', value: 'tiles' },
          { label: 'Analog', value: 'analog' },
          { label: 'Map', value: 'map' },
        ],
      },
      {
        key: 'cities',
        label: 'Cities',
        type: 'multiselect',
        default: ['new-york', 'london', 'tokyo', 'sydney'],
        options: cities.map((city) => ({ label: city.name, value: city.id })),
      },
      hour12Field,
    ],
  })

  registerWidget({
    id: 'weather',
    name: 'Weather',
    description: 'Live conditions and today’s high/low, via Open-Meteo.',
    component: WeatherWidget,
    category: 'weather',
    icon: 'weather',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 6, h: 6 },
    settingsSchema: [
      {
        key: 'useDeviceLocation',
        label: 'Use my location',
        type: 'boolean',
        default: false,
      },
      {
        key: 'location',
        label: 'City',
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
    description: 'A simple to-do list that remembers what you add.',
    component: ChecklistWidget,
    category: 'productivity',
    icon: 'checklist',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 6, h: 8 },
    settingsSchema: [
      {
        key: 'title',
        label: 'Title',
        type: 'string',
        default: 'Tasks',
      },
    ],
  })
})
