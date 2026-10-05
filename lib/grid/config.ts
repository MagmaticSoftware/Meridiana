export type Breakpoint = 'phone' | 'tablet' | 'desktop'

// Grid units are half a "block": the smallest widget is 2×2, but widgets
// move and resize in 1-unit steps, so e.g. a 2×2 can sit dead-center.

export interface BreakpointConfig {
  /** Applies from this viewport width (px) upwards. */
  minWidth: number
  columns: number
  /** The grid never grows wider than this (px); it's centered instead. */
  maxWidth: number
  gap: number
  padding: number
  /**
   * `fill`: rows share the viewport height (no scrolling — the classic
   * screensaver). A number: rows are this fraction of a column's width and
   * the grid scrolls vertically.
   */
  rows: 'fill' | number
}

export const BREAKPOINTS: Record<Breakpoint, BreakpointConfig> = {
  phone: {
    minWidth: 0,
    columns: 4,
    maxWidth: 560,
    gap: 12,
    padding: 16,
    rows: 1,
  },
  tablet: {
    minWidth: 640,
    columns: 8,
    maxWidth: 960,
    gap: 16,
    padding: 24,
    rows: 0.8,
  },
  desktop: {
    minWidth: 900,
    columns: 12,
    maxWidth: 1760,
    gap: 20,
    padding: 32,
    rows: 'fill',
  },
}

/** Largest first, for media-query matching. */
export const BREAKPOINT_ORDER: Breakpoint[] = ['desktop', 'tablet', 'phone']

/** Desktop is the reference layout every other breakpoint derives from. */
export const GRID_COLUMNS = BREAKPOINTS.desktop.columns
/** Minimum number of rows the desktop grid fills the screen with. */
export const GRID_ROWS = 8
/** The desktop grid's height stops growing past this (px), and centers. */
export const DESKTOP_MAX_HEIGHT = 1120
/** Smallest widget, in grid units (a "block"). */
export const MIN_SPAN = 2
