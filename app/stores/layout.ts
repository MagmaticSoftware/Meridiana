import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface LayoutItem {
  id: string
  widgetId: string
  x: number
  y: number
  w: number
  h: number
  config: Record<string, unknown>
}

const placeholderItems: LayoutItem[] = [
  {
    id: '1',
    widgetId: 'clock',
    x: 0,
    y: 0,
    w: 3,
    h: 2,
    config: { variant: 'minimal' },
  },
  {
    id: '2',
    widgetId: 'clock',
    x: 3,
    y: 0,
    w: 3,
    h: 2,
    config: { variant: 'flip' },
  },
  {
    id: '3',
    widgetId: 'clock',
    x: 0,
    y: 2,
    w: 2,
    h: 2,
    config: { variant: 'analog' },
  },
  { id: '4', widgetId: 'date', x: 2, y: 2, w: 1, h: 1, config: {} },
  { id: '5', widgetId: 'weather', x: 3, y: 2, w: 3, h: 2, config: {} },
]

export const useLayoutStore = defineStore(
  'layout',
  () => {
    const items = ref<LayoutItem[]>(placeholderItems)

    function addItem(item: LayoutItem) {
      items.value.push(item)
    }

    function removeItem(id: string) {
      items.value = items.value.filter((item) => item.id !== id)
    }

    function updateItem(id: string, patch: Partial<LayoutItem>) {
      const item = items.value.find((item) => item.id === id)
      if (item) Object.assign(item, patch)
    }

    function exportLayout(): string {
      return JSON.stringify(items.value, null, 2)
    }

    function importLayout(json: string) {
      items.value = JSON.parse(json) as LayoutItem[]
    }

    return {
      items,
      addItem,
      removeItem,
      updateItem,
      exportLayout,
      importLayout,
    }
  },
  { persist: true },
)
