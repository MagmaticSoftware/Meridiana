import { BREAKPOINTS } from './config'
import type { Breakpoint } from './config'
import type { LayoutItem } from './layout'
import { findFreeSlot, rectsOverlap } from './placement'
import type { GridRect } from './placement'

function rectOf(item: LayoutItem): GridRect {
  return { x: item.x, y: item.y, w: item.w, h: item.h }
}

/**
 * Where every item sits at a given breakpoint.
 *
 * Desktop uses each item's own x/y/w/h. Smaller breakpoints use the rects
 * the user arranged there (`item.layouts[bp]`) and pack any item without
 * one — e.g. one added on another device — into the first free slot,
 * following desktop reading order and clamped to the narrower grid.
 */
export function resolveLayout(
  items: readonly LayoutItem[],
  breakpoint: Breakpoint,
): Map<string, GridRect> {
  const result = new Map<string, GridRect>()
  if (breakpoint === 'desktop') {
    for (const item of items) result.set(item.id, rectOf(item))
    return result
  }

  const columns = BREAKPOINTS[breakpoint].columns
  const placed: GridRect[] = []
  const pending: LayoutItem[] = []
  const ordered = [...items].sort((a, b) => a.y - b.y || a.x - b.x)

  for (const item of ordered) {
    const saved = item.layouts?.[breakpoint]
    if (saved) {
      const w = Math.min(saved.w, columns)
      const rect = {
        x: Math.min(saved.x, columns - w),
        y: saved.y,
        w,
        h: saved.h,
      }
      if (!placed.some((other) => rectsOverlap(rect, other))) {
        result.set(item.id, rect)
        placed.push(rect)
        continue
      }
    }
    pending.push(item)
  }

  for (const item of pending) {
    const rect = findFreeSlot(placed, { w: item.w, h: item.h }, columns)
    result.set(item.id, rect)
    placed.push(rect)
  }

  return result
}

/** Number of rows a resolved layout occupies. */
export function layoutRows(rects: Iterable<GridRect>): number {
  let rows = 0
  for (const rect of rects) rows = Math.max(rows, rect.y + rect.h)
  return rows
}

/**
 * Puts `id` at `target` and pushes every item it covers down, in reading
 * order, cascading as needed; untouched items stay put. With `gravity`,
 * other items also float up into free space — used when moving widgets in
 * the phone/tablet stack, where dropping one lower swaps it with the ones
 * it passes. Never fails: the grid grows downwards.
 */
export function placeWithPush(
  rects: ReadonlyMap<string, GridRect>,
  id: string,
  target: GridRect,
  options: { columns: number; gravity?: boolean },
): Map<string, GridRect> {
  const result = new Map<string, GridRect>([[id, target]])
  const placed: GridRect[] = [target]
  const others = [...rects.entries()]
    .filter(([key]) => key !== id)
    .sort(([, a], [, b]) => a.y - b.y || a.x - b.x)

  for (const [key, rect] of others) {
    const w = Math.min(rect.w, options.columns)
    const candidate = {
      x: Math.min(rect.x, options.columns - w),
      y: options.gravity ? 0 : rect.y,
      w,
      h: rect.h,
    }
    while (placed.some((other) => rectsOverlap(candidate, other))) {
      candidate.y++
    }
    result.set(key, candidate)
    placed.push(candidate)
  }
  return result
}
