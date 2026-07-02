import { shallowReactive } from 'vue'
import type { WidgetDefinition } from './types'

const registry = shallowReactive(new Map<string, WidgetDefinition>())

export function registerWidget(definition: WidgetDefinition): void {
  const existing = registry.get(definition.id)
  if (existing && existing.component !== definition.component) {
    console.warn(
      `[widgets] "${definition.id}" is already registered, overwriting.`,
    )
  }
  registry.set(definition.id, definition)
}

export function unregisterWidget(id: string): void {
  registry.delete(id)
}

export function getWidget(id: string): WidgetDefinition | undefined {
  return registry.get(id)
}

export function listWidgets(): WidgetDefinition[] {
  return Array.from(registry.values())
}

export function listWidgetsByCategory(
  category: WidgetDefinition['category'],
): WidgetDefinition[] {
  return listWidgets().filter((widget) => widget.category === category)
}
