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

export function findFreeSlot(
  items: GridRect[],
  size: { w: number; h: number },
  columns: number,
  rows: number,
): GridRect {
  for (let y = 0; y <= rows * 4; y++) {
    for (let x = 0; x <= columns - size.w; x++) {
      const candidate: GridRect = { x, y, w: size.w, h: size.h }
      const collides = items.some((other) => rectsOverlap(candidate, other))
      if (!collides) return candidate
    }
  }
  return { x: 0, y: rows, w: size.w, h: size.h }
}
