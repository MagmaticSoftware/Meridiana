import { describe, expect, it } from 'vitest'
import {
  LAYOUT_VERSION,
  createDefaultLayout,
  migratePersistedLayout,
  parseLayout,
  serializeLayout,
} from '../lib/grid/layout'

const v1Item = {
  id: 'w',
  widgetId: 'weather',
  x: 5,
  y: 1,
  w: 1,
  h: 1,
  layouts: { phone: { x: 1, y: 3, w: 1, h: 1 } },
  config: { location: 'Rome' },
}

describe('layout migration to the 12-column grid', () => {
  it('doubles v0.1 persisted state (which has no version)', () => {
    const migrated = migratePersistedLayout({ items: [v1Item] }) as {
      items: unknown[]
      version: number
    }
    expect(migrated.version).toBe(LAYOUT_VERSION)
    expect(migrated.items[0]).toEqual({
      ...v1Item,
      x: 10,
      y: 2,
      w: 2,
      h: 2,
      layouts: { phone: { x: 2, y: 6, w: 2, h: 2 } },
    })
  })

  it('leaves current state untouched', () => {
    const state = { items: createDefaultLayout(), version: LAYOUT_VERSION }
    expect(migratePersistedLayout(state)).toBe(state)
  })

  it('imports a v0.1 export (bare array) in the new units', () => {
    expect(parseLayout(JSON.stringify([v1Item]))[0]).toMatchObject({
      x: 10,
      w: 2,
    })
  })

  it('round-trips the current export format', () => {
    const items = createDefaultLayout()
    expect(parseLayout(serializeLayout(items))).toEqual(items)
  })

  it('rejects exports from a newer version', () => {
    expect(() =>
      parseLayout(JSON.stringify({ version: LAYOUT_VERSION + 1, items: [] })),
    ).toThrow('newer version')
  })
})
