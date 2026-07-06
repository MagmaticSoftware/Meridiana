<template>
  <div v-if="fullscreenItem" class="relative h-full w-full p-8">
    <component
      :is="getWidget(fullscreenItem.widgetId)!.component"
      :size="{ w: GRID_COLUMNS, h: totalRows }"
      v-bind="fullscreenItem.config"
      @update:config="
        (patch: Record<string, unknown>) =>
          handleConfigUpdate(fullscreenItem!, patch)
      "
    />
    <button
      type="button"
      class="bg-surface-900/80 text-surface-300 hover:text-surface-50 shadow-soft fixed top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur"
      aria-label="Exit fullscreen"
      @click="editor.exitFullscreen()"
    >
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </div>

  <div
    v-else
    ref="gridEl"
    class="grid h-full w-full gap-6 p-8"
    :style="{
      gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
      gridTemplateRows: `repeat(${totalRows}, 1fr)`,
    }"
  >
    <div
      v-for="item in layout.items"
      :key="item.id"
      class="relative"
      :style="itemStyle(item)"
      @dblclick="onItemDblClick(item)"
    >
      <component
        :is="getWidget(item.widgetId)!.component"
        v-if="getWidget(item.widgetId)"
        :size="{ w: item.w, h: item.h }"
        v-bind="item.config"
        @update:config="
          (patch: Record<string, unknown>) => handleConfigUpdate(item, patch)
        "
      />
      <WidgetPlaceholder v-else :widget-id="item.widgetId" />

      <GridItemChrome
        v-if="editor.isEditing"
        :widget-name="getWidget(item.widgetId)?.name ?? item.widgetId"
        :dragging="activeDrag?.item.id === item.id"
        @dragstart="(event) => startDrag(item, event, 'move')"
        @resizestart="(event) => startDrag(item, event, 'resize')"
        @fullscreen="editor.enterFullscreen(item.id)"
        @configure="editor.selectItem(item.id)"
        @remove="layout.removeItem(item.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useLayoutStore } from '~/stores/layout'
import type { LayoutItem } from '~/stores/layout'
import { useEditorStore } from '~/stores/editor'
import { hasCollision } from '~/composables/useGridPlacement'
import type { GridRect } from '~/composables/useGridPlacement'
import { GRID_COLUMNS, GRID_ROWS } from '~~/lib/grid/config'

const layout = useLayoutStore()
const editor = useEditorStore()
const { getWidget } = useWidgetRegistry()

const totalRows = computed(() =>
  Math.max(GRID_ROWS, ...layout.items.map((item) => item.y + item.h), 1),
)

const fullscreenItem = computed(() =>
  layout.items.find((item) => item.id === editor.fullscreenItemId),
)

function handleConfigUpdate(item: LayoutItem, patch: Record<string, unknown>) {
  layout.updateItem(item.id, { config: { ...item.config, ...patch } })
}

function onItemDblClick(item: LayoutItem) {
  if (!editor.isEditing) editor.toggleFullscreen(item.id)
}

const gridEl = ref<HTMLElement | null>(null)

interface DragState {
  item: LayoutItem
  mode: 'move' | 'resize'
  startX: number
  startY: number
  cellW: number
  cellH: number
  colGap: number
  rowGap: number
}

const activeDrag = ref<DragState | null>(null)
const previewRect = ref<GridRect | null>(null)

function itemStyle(item: LayoutItem) {
  const rect =
    activeDrag.value?.item.id === item.id && previewRect.value
      ? previewRect.value
      : item
  return {
    gridColumn: `${rect.x + 1} / span ${rect.w}`,
    gridRow: `${rect.y + 1} / span ${rect.h}`,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getCellMetrics() {
  const el = gridEl.value
  if (!el) return { cellW: 0, cellH: 0, colGap: 0, rowGap: 0 }
  const style = getComputedStyle(el)
  const rect = el.getBoundingClientRect()
  const paddingX =
    parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
  const paddingY =
    parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
  const colGap = parseFloat(style.columnGap) || 0
  const rowGap = parseFloat(style.rowGap) || 0
  const contentWidth = rect.width - paddingX
  const contentHeight = rect.height - paddingY
  const cellW = (contentWidth - colGap * (GRID_COLUMNS - 1)) / GRID_COLUMNS
  const cellH =
    (contentHeight - rowGap * (totalRows.value - 1)) / totalRows.value
  return { cellW, cellH, colGap, rowGap }
}

function startDrag(
  item: LayoutItem,
  event: PointerEvent,
  mode: 'move' | 'resize',
) {
  const { cellW, cellH, colGap, rowGap } = getCellMetrics()
  activeDrag.value = {
    item,
    mode,
    startX: event.clientX,
    startY: event.clientY,
    cellW,
    cellH,
    colGap,
    rowGap,
  }
  previewRect.value = { x: item.x, y: item.y, w: item.w, h: item.h }
  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup', onDragEnd)
}

function onDragMove(event: PointerEvent) {
  const drag = activeDrag.value
  if (!drag) return
  const dx = Math.round(
    (event.clientX - drag.startX) / (drag.cellW + drag.colGap),
  )
  const dy = Math.round(
    (event.clientY - drag.startY) / (drag.cellH + drag.rowGap),
  )

  if (drag.mode === 'move') {
    const maxY = Math.max(GRID_ROWS, ...layout.items.map((i) => i.y + i.h))
    previewRect.value = {
      x: clamp(drag.item.x + dx, 0, GRID_COLUMNS - drag.item.w),
      y: clamp(drag.item.y + dy, 0, Math.max(maxY - drag.item.h, 0)),
      w: drag.item.w,
      h: drag.item.h,
    }
  } else {
    const widget = getWidget(drag.item.widgetId)
    const minW = widget?.minSize.w ?? 1
    const minH = widget?.minSize.h ?? 1
    const maxW = Math.min(
      widget?.maxSize.w ?? GRID_COLUMNS,
      GRID_COLUMNS - drag.item.x,
    )
    const maxH = widget?.maxSize.h ?? GRID_ROWS * 2
    previewRect.value = {
      x: drag.item.x,
      y: drag.item.y,
      w: clamp(drag.item.w + dx, minW, maxW),
      h: clamp(drag.item.h + dy, minH, maxH),
    }
  }
}

function onDragEnd() {
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)
  const drag = activeDrag.value
  const rect = previewRect.value
  if (drag && rect && !hasCollision(rect, drag.item.id, layout.items)) {
    layout.updateItem(drag.item.id, { ...rect })
  }
  activeDrag.value = null
  previewRect.value = null
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (editor.fullscreenItemId) editor.exitFullscreen()
  else if (editor.selectedItemId) editor.selectItem(null)
  else if (editor.isEditing) editor.toggleEditing()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)
})
</script>
