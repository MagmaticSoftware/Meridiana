import { computed } from 'vue'
import {
  registerWidget,
  unregisterWidget,
  getWidget,
  listWidgets,
  listWidgetsByCategory,
} from '~~/lib/widgets/registry'
import type { WidgetCategory } from '~~/lib/widgets/types'

export function useWidgetRegistry() {
  const widgets = computed(() => listWidgets())

  return {
    widgets,
    registerWidget,
    unregisterWidget,
    getWidget,
    listWidgetsByCategory: (category: WidgetCategory) =>
      listWidgetsByCategory(category),
  }
}
