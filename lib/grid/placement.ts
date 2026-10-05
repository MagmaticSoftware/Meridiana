export interface GridRect {
  x: number
  y: number
  w: number
  h: number
}

export function rectsOverlap(a: GridRect, b: GridRect): boolean {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  )
}

export function hasCollision(
  candidate: GridRect,
  ignoreId: string,
  items: (GridRect & { id: string })[],
): boolean {
  return items.some(
    (other) => other.id !== ignoreId && rectsOverlap(candidate, other),
  )
}

/**
 * First position (row by row, left to right) where `size` fits without
 * overlapping anything. Always succeeds: below the lowest item is free.
 */
export function findFreeSlot(
  items: readonly GridRect[],
  size: { w: number; h: number },
  columns: number,
): GridRect {
  const w = Math.min(size.w, columns)
  for (let y = 0; ; y++) {
    for (let x = 0; x <= columns - w; x++) {
      const candidate: GridRect = { x, y, w, h: size.h }
      if (!items.some((other) => rectsOverlap(candidate, other))) {
        return candidate
      }
    }
  }
}

/**
 * Resizing on a fixed-height grid: the biggest rect anchored at `origin`'s
 * top-left, no larger than the size asked for, that doesn't overlap any
 * other item — so the resize handle simply stops at a neighbour.
 */
export function fitResize(
  origin: GridRect,
  desired: { w: number; h: number },
  min: { w: number; h: number },
  others: readonly GridRect[],
): GridRect {
  let best: GridRect = { ...origin, w: min.w, h: min.h }
  let bestScore = -1
  for (let w = desired.w; w >= min.w; w--) {
    for (let h = desired.h; h >= min.h; h--) {
      const candidate = { x: origin.x, y: origin.y, w, h }
      if (others.some((other) => rectsOverlap(candidate, other))) continue
      // Prefer the largest area, then the shape closest to what was asked.
      const score = w * h * 100 - (desired.w - w + desired.h - h)
      if (score > bestScore) {
        best = candidate
        bestScore = score
      }
    }
  }
  return best
}
