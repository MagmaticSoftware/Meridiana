import type { Component } from 'vue'

export type WidgetCategory = 'time' | 'weather' | 'info' | 'productivity'

export interface WidgetSize {
  w: number
  h: number
}

export type WidgetSettingValue = string | number | boolean | string[]

export interface WidgetSettingOption {
  label: string
  value: string | number | boolean
}

export interface WidgetSettingField {
  key: string
  label: string
  /**
   * `select` renders as a segmented control when it has ≤ 4 options;
   * `multiselect` stores an ordered string[] of option values.
   */
  type: 'select' | 'multiselect' | 'boolean' | 'number' | 'string'
  default: WidgetSettingValue
  options?: WidgetSettingOption[]
  min?: number
  max?: number
}

export type WidgetSettingsSchema = WidgetSettingField[]

export interface WidgetDefinition {
  id: string
  name: string
  description: string
  component: Component
  category: WidgetCategory
  /** An `AppIcon` name shown in the widget picker. */
  icon: string
  defaultSize: WidgetSize
  minSize: WidgetSize
  maxSize: WidgetSize
  settingsSchema: WidgetSettingsSchema
}
