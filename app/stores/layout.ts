import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  LAYOUT_VERSION,
  createDefaultLayout,
  migratePersistedLayout,
  parseLayout,
  serializeLayout,
} from '~~/lib/grid/layout'
import type { LayoutItem, ResponsiveBreakpoint } from '~~/lib/grid/layout'
import type { Breakpoint } from '~~/lib/grid/config'
import type { GridRect } from '~~/lib/grid/placement'

export type { LayoutItem, WidgetFrame } from '~~/lib/grid/layout'

export const useLayoutStore = defineStore(
  'layout',
  () => {
    const items = ref<LayoutItem[]>(createDefaultLayout())
    /** Saved-format version; see `LAYOUT_VERSION`. */
    const version = ref(LAYOUT_VERSION)

    function addItem(item: LayoutItem) {
      items.value.push(item)
    }

    function removeItem(id: string) {
      items.value = items.value.filter((item) => item.id !== id)
    }

    function updateItem(id: string, patch: Partial<LayoutItem>) {
      const item = items.value.find((item) => item.id === id)
      if (item) Object.assign(item, patch)
    }

    function updateConfig(id: string, patch: Record<string, unknown>) {
      const item = items.value.find((item) => item.id === id)
      if (item) item.config = { ...item.config, ...patch }
    }

    /**
     * Saves a whole arrangement for one breakpoint: the desktop rects are
     * the items' own x/y/w/h, other breakpoints get `layouts[bp]`.
     */
    function applyArrangement(
      rects: ReadonlyMap<string, GridRect>,
      breakpoint: Breakpoint,
    ) {
      for (const item of items.value) {
        const rect = rects.get(item.id)
        if (!rect) continue
        if (breakpoint === 'desktop') Object.assign(item, rect)
        else item.layouts = { ...item.layouts, [breakpoint]: { ...rect } }
      }
    }

    /** Forgets a breakpoint's arrangement so it's derived from desktop again. */
    function resetBreakpoint(breakpoint: ResponsiveBreakpoint) {
      for (const item of items.value) {
        if (!item.layouts?.[breakpoint]) continue
        const { [breakpoint]: _removed, ...rest } = item.layouts
        item.layouts = Object.keys(rest).length ? rest : undefined
      }
    }

    function resetLayout() {
      items.value = createDefaultLayout()
    }

    function exportLayout(): string {
      return serializeLayout(items.value)
    }

    /** Replaces the layout; throws (leaving it untouched) if invalid. */
    function importLayout(json: string) {
      items.value = parseLayout(json)
    }

    return {
      items,
      version,
      addItem,
      removeItem,
      updateItem,
      updateConfig,
      applyArrangement,
      resetBreakpoint,
      resetLayout,
      exportLayout,
      importLayout,
    }
  },
  {
    persist: {
      // Older saved layouts are converted before the store sees them.
      serializer: {
        serialize: JSON.stringify,
        deserialize: (raw) => migratePersistedLayout(JSON.parse(raw)) as never,
      },
    },
  },
)
