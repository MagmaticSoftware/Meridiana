<template>
  <div class="flex min-h-0 flex-col">
    <header class="px-5 pt-5 pb-3">
      <h2 class="text-ink text-base font-semibold">Add a widget</h2>
      <p class="text-ink-muted text-xs">It goes into the first free spot.</p>
    </header>
    <div class="grid grid-cols-2 gap-2 overflow-y-auto px-3 pb-3">
      <button
        v-for="widget in widgets"
        :key="widget.id"
        type="button"
        class="bg-tint hover:bg-tint-strong flex flex-col items-start gap-2 rounded-2xl p-3 text-left transition-colors active:scale-[0.98]"
        @click="addWidget(widget.id)"
      >
        <span
          class="bg-accent/15 text-accent flex h-9 w-9 items-center justify-center rounded-xl"
        >
          <AppIcon :name="widget.icon" class="h-5 w-5" />
        </span>
        <span>
          <span class="text-ink block text-sm font-semibold">{{
            widget.name
          }}</span>
          <span class="text-ink-muted line-clamp-2 block text-xs leading-snug">
            {{ widget.description }}
          </span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWidgetRegistry } from '~/composables/useWidgetRegistry'
import { useLayoutStore } from '~/stores/layout'
import { useEditorStore } from '~/stores/editor'
import { findFreeSlot } from '~~/lib/grid/placement'
import { GRID_COLUMNS } from '~~/lib/grid/config'

const { widgets, getWidget } = useWidgetRegistry()
const layout = useLayoutStore()
const editor = useEditorStore()

function addWidget(widgetId: string) {
  const widget = getWidget(widgetId)
  if (!widget) return

  // Placed on the desktop grid; smaller breakpoints pack it into their
  // own first free slot automatically.
  const slot = findFreeSlot(layout.items, widget.defaultSize, GRID_COLUMNS)

  layout.addItem({
    id: crypto.randomUUID(),
    widgetId: widget.id,
    ...slot,
    config: {},
  })

  editor.closePanel()
}
</script>
