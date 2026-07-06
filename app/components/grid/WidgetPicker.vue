<template>
  <div class="fixed bottom-4 left-1/2 z-20 -translate-x-1/2">
    <button
      type="button"
      class="bg-accent-500 text-surface-950 shadow-soft-lg flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-105"
      aria-label="Add widget"
      @click="editor.togglePicker()"
    >
      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none">
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>

    <Transition name="picker">
      <div
        v-if="editor.isPickerOpen"
        class="bg-surface-900/95 shadow-soft-lg border-surface-700 absolute bottom-14 left-1/2 w-80 -translate-x-1/2 space-y-1 rounded-2xl border p-2 backdrop-blur"
      >
        <button
          v-for="widget in widgets"
          :key="widget.id"
          type="button"
          class="hover:bg-surface-800 flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left"
          @click="addWidget(widget.id)"
        >
          <span class="flex-1">
            <span class="text-surface-100 block text-sm">{{
              widget.name
            }}</span>
            <span class="text-surface-400 block text-xs">{{
              widget.description
            }}</span>
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useWidgetRegistry } from '~/composables/useWidgetRegistry'
import { useLayoutStore } from '~/stores/layout'
import { useEditorStore } from '~/stores/editor'
import { findFreeSlot } from '~/composables/useGridPlacement'
import { GRID_COLUMNS, GRID_ROWS } from '~~/lib/grid/config'

const { widgets } = useWidgetRegistry()
const layout = useLayoutStore()
const editor = useEditorStore()

function addWidget(widgetId: string) {
  const widget = widgets.value.find((candidate) => candidate.id === widgetId)
  if (!widget) return

  const slot = findFreeSlot(
    layout.items,
    widget.defaultSize,
    GRID_COLUMNS,
    GRID_ROWS,
  )

  layout.addItem({
    id: crypto.randomUUID(),
    widgetId: widget.id,
    ...slot,
    config: {},
  })

  editor.isPickerOpen = false
}
</script>

<style scoped>
.picker-enter-active,
.picker-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.picker-enter-from,
.picker-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
