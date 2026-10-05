<template>
  <div
    ref="scrollEl"
    class="flex h-full w-full justify-center"
    :class="
      scrolls
        ? 'overflow-y-auto overscroll-contain'
        : 'items-center overflow-hidden'
    "
  >
    <!-- Caps the grid's size per breakpoint and provides the container
         width that scrolling row heights are computed from. -->
    <div
      class="w-full [container-type:inline-size]"
      :class="scrolls ? '' : 'h-full'"
      :style="{
        maxWidth: `${config.maxWidth}px`,
        maxHeight: scrolls ? undefined : `${DESKTOP_MAX_HEIGHT}px`,
      }"
    >
      <div
        ref="gridEl"
        class="grid w-full"
        :class="scrolls ? '' : 'h-full'"
        :style="gridStyle"
      >
        <GridGuides
          v-if="editor.isEditing"
          :columns="config.columns"
          :rows="totalRows"
          :gap="config.gap"
          style="grid-column: 1 / -1; grid-row: 1 / -1"
        />

        <div
          v-for="item in layout.items"
          :key="item.id"
          class="relative min-h-0 min-w-0 [container-type:size]"
          :class="{ 'z-10': activeDrag?.item.id === item.id }"
          :style="itemStyle(item)"
          @dblclick="onItemDblClick(item)"
        >
          <WidgetCard :frame="item.frame ?? 'card'">
            <component
              :is="getWidget(item.widgetId)!.component"
              v-if="getWidget(item.widgetId)"
              :size="rectFor(item)"
              v-bind="item.config"
              @update:config="
                (patch: Record<string, unknown>) =>
                  layout.updateConfig(item.id, patch)
              "
            />
            <WidgetPlaceholder v-else :widget-id="item.widgetId" />
          </WidgetCard>

          <GridItemChrome
            v-if="editor.isEditing"
            :widget-name="getWidget(item.widgetId)?.name ?? item.widgetId"
            :dragging="activeDrag?.item.id === item.id"
            :body-drag="!scrolls"
            @dragstart="(event) => startDrag(item, event, 'move')"
            @resizestart="(event) => startDrag(item, event, 'resize')"
            @fullscreen="editor.enterFullscreen(item.id)"
            @configure="editor.selectItem(item.id)"
            @remove="removeItem(item.id)"
          />
        </div>
      </div>
    </div>
  </div>

  <Transition name="zoom">
    <div
      v-if="fullscreenItem && fullscreenWidget"
      class="fixed inset-0 z-40 bg-black/30 p-[6vmin] backdrop-blur-2xl"
      @dblclick="editor.exitFullscreen()"
    >
      <div class="frame-clear h-full w-full [container-type:size]">
        <component
          :is="fullscreenWidget.component"
          :size="{ w: GRID_COLUMNS, h: GRID_ROWS }"
          v-bind="fullscreenItem.config"
          @update:config="
            (patch: Record<string, unknown>) =>
              layout.updateConfig(fullscreenItem!.id, patch)
          "
        />
      </div>
      <button
        type="button"
        class="ui-panel ui-icon-button fixed top-[max(16px,env(safe-area-inset-top))] right-4 h-10 w-10"
        aria-label="Exit fullscreen"
        @click="editor.exitFullscreen()"
      >
        <AppIcon name="close" class="h-4 w-4" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useLayoutStore } from '~/stores/layout'
import type { LayoutItem } from '~/stores/layout'
import { useEditorStore } from '~/stores/editor'
import { useBreakpoint } from '~/composables/useBreakpoint'
import { useWidgetRegistry } from '~/composables/useWidgetRegistry'
import { fitResize } from '~~/lib/grid/placement'
import type { GridRect } from '~~/lib/grid/placement'
import {
  layoutRows,
  placeWithPush,
  resolveLayout,
} from '~~/lib/grid/responsive'
import {
  BREAKPOINTS,
  DESKTOP_MAX_HEIGHT,
  GRID_COLUMNS,
  GRID_ROWS,
  MIN_SPAN,
} from '~~/lib/grid/config'

/** Room below a scrolling grid so the dock never covers the last row. */
const DOCK_CLEARANCE = 96
/** Distance from the scroll edge (px) that starts auto-scroll while dragging. */
const AUTOSCROLL_EDGE = 72

const layout = useLayoutStore()
const editor = useEditorStore()
const { getWidget } = useWidgetRegistry()
const breakpoint = useBreakpoint()

const config = computed(() => BREAKPOINTS[breakpoint.value])
const scrolls = computed(() => config.value.rows !== 'fill')

/** Every item's rect at the current breakpoint. */
const rects = computed(() => resolveLayout(layout.items, breakpoint.value))

/**
 * While dragging: the arrangement the drop would produce, with only the
 * widgets actually covered pushed down. In the phone/tablet stack, moved
 * widgets also let the others float up, so dragging one lower swaps it.
 */
const previewLayout = computed(() => {
  const drag = activeDrag.value
  const rect = previewRect.value
  if (!drag || !rect) return null
  return placeWithPush(rects.value, drag.item.id, rect, {
    columns: config.value.columns,
    gravity: scrolls.value && drag.mode === 'move',
  })
})

function rectFor(item: LayoutItem): GridRect {
  if (activeDrag.value?.item.id === item.id && previewRect.value) {
    return previewRect.value
  }
  return previewLayout.value?.get(item.id) ?? rects.value.get(item.id) ?? item
}

/** Rows as laid out when the drag started, so the grid doesn't jump. */
const baseRows = computed(() => layoutRows(rects.value.values()))

const totalRows = computed(() => {
  let rows = baseRows.value
  if (previewLayout.value) {
    rows = Math.max(rows, layoutRows(previewLayout.value.values()))
  }
  return scrolls.value ? Math.max(rows, MIN_SPAN) : Math.max(rows, GRID_ROWS)
})

const gridStyle = computed(() => {
  const { columns, gap, padding, rows } = config.value
  const rowSize =
    rows === 'fill'
      ? 'minmax(0, 1fr)'
      : `calc((100cqw - ${2 * padding + (columns - 1) * gap}px) / ${columns} * ${rows})`
  return {
    gap: `${gap}px`,
    padding: `${padding}px`,
    // Keep the last row (and its resize handles) clear of the dock.
    paddingBottom:
      scrolls.value || editor.isEditing
        ? `${padding + DOCK_CLEARANCE}px`
        : undefined,
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${totalRows.value}, ${rowSize})`,
  }
})

function itemStyle(item: LayoutItem) {
  const rect = rectFor(item)
  return {
    gridColumn: `${rect.x + 1} / span ${rect.w}`,
    gridRow: `${rect.y + 1} / span ${rect.h}`,
  }
}

const fullscreenItem = computed(() =>
  layout.items.find((item) => item.id === editor.fullscreenItemId),
)
const fullscreenWidget = computed(() =>
  fullscreenItem.value ? getWidget(fullscreenItem.value.widgetId) : undefined,
)

function onItemDblClick(item: LayoutItem) {
  if (!editor.isEditing) editor.enterFullscreen(item.id)
}

function removeItem(id: string) {
  if (editor.selectedItemId === id) editor.selectItem(null)
  layout.removeItem(id)
}

// --- Drag & resize (mouse, pen and touch) --------------------------------

const scrollEl = ref<HTMLElement | null>(null)
const gridEl = ref<HTMLElement | null>(null)

interface DragState {
  item: LayoutItem
  mode: 'move' | 'resize'
  /** The item's rect at this breakpoint when the drag started. */
  origin: GridRect
  startX: number
  startY: number
  startScroll: number
  stepX: number
  stepY: number
  lastX: number
  lastY: number
}

const activeDrag = ref<DragState | null>(null)
const previewRect = ref<GridRect | null>(null)
let autoScrollFrame = 0

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

/** Distance in px between the starts of two adjacent cells. */
function getCellStep() {
  const el = gridEl.value
  if (!el) return { stepX: 1, stepY: 1 }
  const style = getComputedStyle(el)
  const rect = el.getBoundingClientRect()
  const colGap = parseFloat(style.columnGap) || 0
  const rowGap = parseFloat(style.rowGap) || 0
  const width =
    rect.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
  const height =
    rect.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
  return {
    stepX: (width + colGap) / config.value.columns,
    stepY: (height + rowGap) / totalRows.value,
  }
}

function startDrag(
  item: LayoutItem,
  event: PointerEvent,
  mode: 'move' | 'resize',
) {
  event.preventDefault()
  const origin = { ...rectFor(item) }
  activeDrag.value = {
    item,
    mode,
    origin,
    startX: event.clientX,
    startY: event.clientY,
    startScroll: scrollEl.value?.scrollTop ?? 0,
    lastX: event.clientX,
    lastY: event.clientY,
    ...getCellStep(),
  }
  previewRect.value = { ...origin }
  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup', onDragEnd)
  window.addEventListener('pointercancel', onDragEnd)
  if (scrolls.value) autoScrollFrame = requestAnimationFrame(autoScroll)
}

function updatePreview() {
  const drag = activeDrag.value
  if (!drag) return
  const scrolled = (scrollEl.value?.scrollTop ?? 0) - drag.startScroll
  const dx = Math.round((drag.lastX - drag.startX) / drag.stepX)
  const dy = Math.round((drag.lastY - drag.startY + scrolled) / drag.stepY)
  const { origin } = drag
  const columns = config.value.columns

  if (drag.mode === 'move') {
    // Dropping just below the last row grows the grid by one.
    previewRect.value = {
      x: clamp(origin.x + dx, 0, columns - origin.w),
      y: clamp(origin.y + dy, 0, baseRows.value),
      w: origin.w,
      h: origin.h,
    }
  } else {
    const widget = getWidget(drag.item.widgetId)
    const maxW = Math.min(widget?.maxSize.w ?? columns, columns - origin.x)
    const maxH = widget?.maxSize.h ?? GRID_ROWS
    const min = {
      w: Math.min(widget?.minSize.w ?? MIN_SPAN, maxW),
      h: widget?.minSize.h ?? MIN_SPAN,
    }
    const desired = {
      w: clamp(origin.w + dx, min.w, maxW),
      h: clamp(origin.h + dy, min.h, maxH),
    }
    if (scrolls.value) {
      // Scrolling grids have room to spare: neighbours get pushed down.
      previewRect.value = { x: origin.x, y: origin.y, ...desired }
    } else {
      // The desktop grid fills the screen, so pushing would squash every
      // row; the handle stops at the nearest neighbour instead.
      const others = [...rects.value]
        .filter(([id]) => id !== drag.item.id)
        .map(([, rect]) => rect)
      previewRect.value = fitResize(origin, desired, min, others)
    }
  }
}

function onDragMove(event: PointerEvent) {
  const drag = activeDrag.value
  if (!drag) return
  drag.lastX = event.clientX
  drag.lastY = event.clientY
  updatePreview()
}

/** Scrolls the grid while a dragged widget is held near its top/bottom. */
function autoScroll() {
  const drag = activeDrag.value
  const el = scrollEl.value
  if (!drag || !el) return
  const bounds = el.getBoundingClientRect()
  const fromTop = drag.lastY - bounds.top
  const fromBottom = bounds.bottom - drag.lastY
  let speed = 0
  if (fromTop < AUTOSCROLL_EDGE) speed = -(AUTOSCROLL_EDGE - fromTop) / 4
  else if (fromBottom < AUTOSCROLL_EDGE)
    speed = (AUTOSCROLL_EDGE - fromBottom) / 4
  if (speed) {
    el.scrollTop += speed
    updatePreview()
  }
  autoScrollFrame = requestAnimationFrame(autoScroll)
}

function onDragEnd() {
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)
  window.removeEventListener('pointercancel', onDragEnd)
  cancelAnimationFrame(autoScrollFrame)
  const drag = activeDrag.value
  const rect = previewRect.value
  // A tap on the grip (no change) must not rearrange anything.
  const moved =
    !!drag &&
    !!rect &&
    (['x', 'y', 'w', 'h'] as const).some(
      (key) => rect[key] !== drag.origin[key],
    )
  if (moved && previewLayout.value) {
    layout.applyArrangement(previewLayout.value, breakpoint.value)
  }
  activeDrag.value = null
  previewRect.value = null
}

onUnmounted(onDragEnd)
</script>

<style scoped>
.zoom-enter-active,
.zoom-leave-active {
  transition:
    opacity 0.3s var(--ease-out-soft),
    transform 0.3s var(--ease-out-soft);
}
.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
