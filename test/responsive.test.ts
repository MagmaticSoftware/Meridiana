import { describe, expect, it } from 'vitest'
import { BREAKPOINTS } from '../lib/grid/config'
import {
  createDefaultLayout,
  parseLayout,
  serializeLayout,
} from '../lib/grid/layout'
import type { LayoutItem } from '../lib/grid/layout'
import { rectsOverlap } from '../lib/grid/placement'
import {
  layoutRows,
  placeWithPush,
  resolveLayout,
} from '../lib/grid/responsive'

function item(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
): LayoutItem {
  return { id, widgetId: 'clock', x, y, w, h, config: {} }
}

function assertValid(
  rects: Map<string, { x: number; y: number; w: number; h: number }>,
  columns: number,
) {
  const all = [...rects.values()]
  for (const [i, rect] of all.entries()) {
    expect(rect.x + rect.w).toBeLessThanOrEqual(columns)
    for (const other of all.slice(i + 1))
      expect(rectsOverlap(rect, other)).toBe(false)
  }
}

describe('resolveLayout', () => {
  it('uses item positions as-is on desktop', () => {
    const items = [item('a', 3, 1, 2, 2)]
    expect(resolveLayout(items, 'desktop').get('a')).toEqual({
      x: 3,
      y: 1,
      w: 2,
      h: 2,
    })
  })

  it.each(['phone', 'tablet'] as const)(
    'packs the default layout into the %s grid without overlaps',
    (bp) => {
      const rects = resolveLayout(createDefaultLayout(), bp)
      expect(rects.size).toBe(createDefaultLayout().length)
      assertValid(rects, BREAKPOINTS[bp].columns)
    },
  )

  it('follows desktop reading order and clamps widths on phone', () => {
    const items = [item('second', 6, 0, 6, 2), item('first', 0, 0, 6, 4)]
    const rects = resolveLayout(items, 'phone')
    expect(rects.get('first')).toEqual({ x: 0, y: 0, w: 4, h: 4 })
    expect(rects.get('second')).toEqual({ x: 0, y: 4, w: 4, h: 2 })
  })

  it('keeps saved positions and fits new items around them', () => {
    const items = [
      {
        ...item('a', 0, 0, 2, 1),
        layouts: { phone: { x: 0, y: 3, w: 2, h: 1 } },
      },
      item('b', 2, 0, 2, 1),
    ]
    const rects = resolveLayout(items, 'phone')
    expect(rects.get('a')).toEqual({ x: 0, y: 3, w: 2, h: 1 })
    expect(rects.get('b')).toEqual({ x: 0, y: 0, w: 2, h: 1 })
    expect(layoutRows(rects.values())).toBe(4)
  })

  it('re-packs a saved rect that would overlap', () => {
    const items = [
      {
        ...item('a', 0, 0, 1, 1),
        layouts: { tablet: { x: 0, y: 0, w: 2, h: 2 } },
      },
      {
        ...item('b', 1, 0, 1, 1),
        layouts: { tablet: { x: 1, y: 1, w: 2, h: 2 } },
      },
    ]
    assertValid(resolveLayout(items, 'tablet'), 4)
  })
})

describe('layout validation with breakpoints', () => {
  it('accepts per-breakpoint rects and rejects unknown breakpoints', () => {
    const ok = [
      {
        ...item('a', 0, 0, 1, 1),
        layouts: { phone: { x: 0, y: 0, w: 2, h: 1 } },
      },
    ]
    expect(parseLayout(serializeLayout(ok))).toEqual(ok)
    const bad = [
      {
        ...item('a', 0, 0, 1, 1),
        layouts: { watch: { x: 0, y: 0, w: 1, h: 1 } },
      },
    ]
    expect(() => parseLayout(serializeLayout(bad as LayoutItem[]))).toThrow(
      'malformed',
    )
  })
})

describe('placeWithPush', () => {
  const stack = new Map([
    ['clock', { x: 0, y: 0, w: 2, h: 2 }],
    ['calendar', { x: 0, y: 2, w: 2, h: 2 }],
    ['weather', { x: 0, y: 4, w: 1, h: 1 }],
  ])

  it('swaps when a widget is dropped lower in a stack', () => {
    const result = placeWithPush(
      stack,
      'clock',
      { x: 0, y: 2, w: 2, h: 2 },
      { columns: 2, gravity: true },
    )
    expect(result.get('calendar')).toEqual({ x: 0, y: 0, w: 2, h: 2 })
    expect(result.get('clock')).toEqual({ x: 0, y: 2, w: 2, h: 2 })
    expect(result.get('weather')).toEqual({ x: 0, y: 4, w: 1, h: 1 })
  })

  it('leaves untouched items where they are without gravity', () => {
    // Clock shrinks: nothing below may float up.
    const result = placeWithPush(
      stack,
      'clock',
      { x: 0, y: 0, w: 2, h: 1 },
      {
        columns: 2,
      },
    )
    expect(result.get('calendar')).toEqual({ x: 0, y: 2, w: 2, h: 2 })
    expect(result.get('weather')).toEqual({ x: 0, y: 4, w: 1, h: 1 })
  })

  it('makes room for a widget growing on a full desktop grid', () => {
    const rects = resolveLayout(createDefaultLayout(), 'desktop')
    // Clock 6×4 → 6×6: the row below has to move down, never be refused.
    const result = placeWithPush(
      rects,
      'clock',
      { x: 0, y: 0, w: 6, h: 6 },
      { columns: 12 },
    )
    assertValid(result, 12)
    expect(result.get('clock')).toEqual({ x: 0, y: 0, w: 6, h: 6 })
    for (const [id, rect] of rects) {
      if (id === 'clock') continue
      // Every other widget keeps its size.
      expect({ w: result.get(id)!.w, h: result.get(id)!.h }).toEqual({
        w: rect.w,
        h: rect.h,
      })
    }
  })

  it('never produces overlaps', () => {
    const rects = resolveLayout(createDefaultLayout(), 'tablet')
    for (const [id] of rects) {
      const result = placeWithPush(
        rects,
        id,
        { x: 3, y: 1, w: 2, h: 2 },
        { columns: 8 },
      )
      assertValid(result, 8)
    }
  })
})
