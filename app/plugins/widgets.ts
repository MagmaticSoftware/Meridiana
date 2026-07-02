import { registerWidget } from '~~/lib/widgets/registry'
import ClockWidget from '~/components/widgets/Clock/ClockWidget.vue'

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
})
