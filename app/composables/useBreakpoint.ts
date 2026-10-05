import { readonly, ref } from 'vue'
import { BREAKPOINT_ORDER, BREAKPOINTS } from '~~/lib/grid/config'
import type { Breakpoint } from '~~/lib/grid/config'

// Shared app-wide: one set of media-query listeners, however many callers.
const current = ref<Breakpoint>('desktop')
let initialized = false

function init() {
  if (initialized || !import.meta.client) return
  initialized = true
  const queries = BREAKPOINT_ORDER.map((name) => ({
    name,
    query: window.matchMedia(`(min-width: ${BREAKPOINTS[name].minWidth}px)`),
  }))
  const update = () => {
    current.value = queries.find((q) => q.query.matches)?.name ?? 'phone'
  }
  for (const { query } of queries) query.addEventListener('change', update)
  update()
}

/** The active grid breakpoint (phone / tablet / desktop). */
export function useBreakpoint() {
  init()
  return readonly(current)
}
