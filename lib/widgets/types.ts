import type { Component } from 'vue'

export type WidgetCategory = 'time' | 'weather' | 'info' | 'productivity'

export interface WidgetSize {
  w: number
  h: number
}

export type WidgetSettingValue = string | number | boolean

export interface WidgetSettingOption {
  label: string
  value: WidgetSettingValue
}

export interface WidgetSettingField {
  key: string
  label: string
  type: 'select' | 'boolean' | 'number' | 'string'
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
  defaultSize: WidgetSize
  minSize: WidgetSize
  maxSize: WidgetSize
  settingsSchema: WidgetSettingsSchema
}
