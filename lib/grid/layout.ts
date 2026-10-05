import type { GridRect } from './placement'

export type WidgetFrame = 'card' | 'clear'

/**
 * Version of the saved layout format.
 * 1 — v0.1 6-column grid. 2 — 12-column grid (half-size units: every v1
 * coordinate and size doubled, a 2×2 is the smallest widget).
 */
export const LAYOUT_VERSION = 2

/** Breakpoints that can override the desktop position. */
export type ResponsiveBreakpoint = 'phone' | 'tablet'

export interface LayoutItem {
  id: string
  widgetId: string
  x: number
  y: number
  w: number
  h: number
  /** Card surface or transparent; missing on layouts saved by v0.1. */
  frame?: WidgetFrame
  /**
   * Positions arranged by the user on smaller screens. x/y/w/h above are
   * the desktop layout; a breakpoint without an entry is derived from it.
   */
  layouts?: Partial<Record<ResponsiveBreakpoint, GridRect>>
  config: Record<string, unknown>
}

const defaultLayout: readonly LayoutItem[] = [
  {
    id: 'clock',
    widgetId: 'clock',
    x: 0,
    y: 0,
    w: 6,
    h: 4,
    config: { variant: 'condensed', showSeconds: true, showDate: true },
  },
  {
    id: 'calendar',
    widgetId: 'calendar',
    x: 6,
    y: 0,
    w: 4,
    h: 4,
    config: {},
  },
  { id: 'weather', widgetId: 'weather', x: 10, y: 0, w: 2, h: 2, config: {} },
  { id: 'date', widgetId: 'date', x: 10, y: 2, w: 2, h: 2, config: {} },
  {
    id: 'world-analog',
    widgetId: 'world-clock',
    x: 0,
    y: 4,
    w: 6,
    h: 2,
    config: { variant: 'analog' },
  },
  {
    id: 'world-map',
    widgetId: 'world-clock',
    x: 6,
    y: 4,
    w: 6,
    h: 4,
    config: { variant: 'map' },
  },
  {
    id: 'checklist',
    widgetId: 'checklist',
    x: 0,
    y: 6,
    w: 4,
    h: 2,
    config: {},
  },
  {
    id: 'clock-stacked',
    widgetId: 'clock',
    x: 4,
    y: 6,
    w: 2,
    h: 2,
    config: { variant: 'stacked' },
  },
]

/** A fresh copy of the first-run layout (never share the module array). */
export function createDefaultLayout(): LayoutItem[] {
  return structuredClone(defaultLayout) as LayoutItem[]
}

function isGridInt(value: unknown, min: number): value is number {
  return Number.isInteger(value) && (value as number) >= min
}

function isRect(value: unknown): value is GridRect {
  if (typeof value !== 'object' || value === null) return false
  const rect = value as Record<string, unknown>
  return (
    isGridInt(rect.x, 0) &&
    isGridInt(rect.y, 0) &&
    isGridInt(rect.w, 1) &&
    isGridInt(rect.h, 1)
  )
}

function isLayouts(value: unknown): boolean {
  if (value === undefined) return true
  if (typeof value !== 'object' || value === null) return false
  return Object.entries(value).every(
    ([key, rect]) => (key === 'phone' || key === 'tablet') && isRect(rect),
  )
}

export function isLayoutItem(value: unknown): value is LayoutItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.widgetId === 'string' &&
    isRect(item) &&
    isLayouts(item.layouts) &&
    (item.frame === undefined ||
      item.frame === 'card' ||
      item.frame === 'clear') &&
    typeof item.config === 'object' &&
    item.config !== null &&
    !Array.isArray(item.config)
  )
}

function scaleRect(rect: GridRect, factor: number): GridRect {
  return {
    x: rect.x * factor,
    y: rect.y * factor,
    w: rect.w * factor,
    h: rect.h * factor,
  }
}

/** Converts items saved in an older layout version to the current one. */
export function upgradeItems(
  items: LayoutItem[],
  fromVersion: number,
): LayoutItem[] {
  if (fromVersion >= LAYOUT_VERSION) return items
  return items.map((item) => {
    const upgraded: LayoutItem = { ...item, ...scaleRect(item, 2) }
    if (item.layouts) {
      upgraded.layouts = Object.fromEntries(
        Object.entries(item.layouts).map(([bp, rect]) => [
          bp,
          scaleRect(rect, 2),
        ]),
      )
    }
    return upgraded
  })
}

/**
 * Upgrades the persisted `layout` store state. v1 state had no `version`
 * field, so its absence means "6-column grid".
 */
export function migratePersistedLayout(state: unknown): unknown {
  if (typeof state !== 'object' || state === null) return state
  const { items, version } = state as { items?: unknown; version?: unknown }
  if (!Array.isArray(items) || version === LAYOUT_VERSION) return state
  const from = typeof version === 'number' ? version : 1
  return {
    ...state,
    items: upgradeItems(items.filter(isLayoutItem), from),
    version: LAYOUT_VERSION,
  }
}

/** The JSON written by "Export". */
export function serializeLayout(items: LayoutItem[]): string {
  return JSON.stringify({ version: LAYOUT_VERSION, items }, null, 2)
}

/**
 * Parses an exported layout, throwing a readable error if it's invalid.
 * Accepts the current `{ version, items }` format and v0.1's bare array.
 */
export function parseLayout(json: string): LayoutItem[] {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    throw new Error('Not valid JSON.')
  }
  let version = 1
  if (!Array.isArray(data) && typeof data === 'object' && data !== null) {
    const wrapped = data as { version?: unknown; items?: unknown }
    if (typeof wrapped.version === 'number') version = wrapped.version
    data = wrapped.items
  }
  if (!Array.isArray(data)) throw new Error('Expected a list of widgets.')
  if (version > LAYOUT_VERSION) {
    throw new Error('This layout was made by a newer version of Meridiana.')
  }
  const invalid = data.findIndex((item) => !isLayoutItem(item))
  if (invalid !== -1) throw new Error(`Widget #${invalid + 1} is malformed.`)
  return upgradeItems(data as LayoutItem[], version)
}
