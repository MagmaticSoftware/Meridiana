import { describe, expect, it } from 'vitest'
import {
  findFreeSlot,
  fitResize,
  hasCollision,
  rectsOverlap,
} from '../lib/grid/placement'
import {
  createDefaultLayout,
  parseLayout,
  serializeLayout,
} from '../lib/grid/layout'
import { GRID_COLUMNS, GRID_ROWS } from '../lib/grid/config'

describe('placement', () => {
  it('detects overlap but not touching edges', () => {
    expect(
      rectsOverlap({ x: 0, y: 0, w: 2, h: 2 }, { x: 1, y: 1, w: 2, h: 2 }),
    ).toBe(true)
    expect(
      rectsOverlap({ x: 0, y: 0, w: 2, h: 2 }, { x: 2, y: 0, w: 2, h: 2 }),
    ).toBe(false)
  })

  it('ignores the item being moved', () => {
    const items = [{ id: 'a', x: 0, y: 0, w: 2, h: 2 }]
    expect(hasCollision({ x: 1, y: 1, w: 2, h: 2 }, 'a', items)).toBe(false)
    expect(hasCollision({ x: 1, y: 1, w: 2, h: 2 }, 'b', items)).toBe(true)
  })

  it('finds the first free slot, row by row', () => {
    const items = [{ x: 0, y: 0, w: 4, h: 1 }]
    expect(findFreeSlot(items, { w: 2, h: 1 }, 6)).toEqual({
      x: 4,
      y: 0,
      w: 2,
      h: 1,
    })
  })
})

describe('default layout', () => {
  const layout = createDefaultLayout()

  it('fits the grid without overlaps', () => {
    for (const item of layout) {
      expect(item.x + item.w).toBeLessThanOrEqual(GRID_COLUMNS)
      expect(item.y + item.h).toBeLessThanOrEqual(GRID_ROWS)
      expect(hasCollision(item, item.id, layout)).toBe(false)
    }
  })

  it('returns a fresh copy each time', () => {
    const other = createDefaultLayout()
    other[0]!.x = 99
    expect(createDefaultLayout()[0]!.x).not.toBe(99)
  })
})

describe('parseLayout', () => {
  it('round-trips an exported layout', () => {
    const layout = createDefaultLayout()
    expect(parseLayout(serializeLayout(layout))).toEqual(layout)
  })

  it.each([
    ['not json', 'Not valid JSON.'],
    ['{}', 'Expected a list of widgets.'],
    [
      '[{"id":"a","widgetId":"clock","x":-1,"y":0,"w":1,"h":1,"config":{}}]',
      'Widget #1 is malformed.',
    ],
    [
      '[{"id":"a","widgetId":"clock","x":0,"y":0,"w":1,"h":1}]',
      'Widget #1 is malformed.',
    ],
  ])('rejects %s', (json, message) => {
    expect(() => parseLayout(json)).toThrow(message)
  })
})

describe('fitResize', () => {
  const origin = { x: 0, y: 0, w: 6, h: 4 }
  const calendar = { x: 6, y: 0, w: 4, h: 4 }
  const below = { x: 0, y: 4, w: 6, h: 2 }
  const min = { w: 2, h: 2 }

  it('grows freely into empty space', () => {
    expect(fitResize(origin, { w: 6, h: 4 }, min, [])).toEqual(origin)
    expect(fitResize(origin, { w: 8, h: 6 }, min, [])).toEqual({
      x: 0,
      y: 0,
      w: 8,
      h: 6,
    })
  })

  it('stops at the nearest neighbour', () => {
    expect(fitResize(origin, { w: 8, h: 4 }, min, [calendar, below])).toEqual(
      origin,
    )
    expect(fitResize(origin, { w: 6, h: 6 }, min, [calendar, below])).toEqual(
      origin,
    )
  })

  it('keeps the direction that still has room', () => {
    // Wider is blocked by the calendar, taller is free.
    expect(fitResize(origin, { w: 8, h: 6 }, min, [calendar])).toEqual({
      x: 0,
      y: 0,
      w: 6,
      h: 6,
    })
  })

  it('always allows shrinking', () => {
    expect(fitResize(origin, { w: 3, h: 2 }, min, [calendar, below])).toEqual({
      x: 0,
      y: 0,
      w: 3,
      h: 2,
    })
  })
})
