<template>
  <div
    class="absolute inset-0 rounded-[var(--radius-card)] ring-2 transition-[box-shadow,transform] duration-150 select-none"
    :class="[
      'bg-accent/5 ring-accent/70',
      bodyDrag ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : '',
      dragging ? 'scale-[1.015] shadow-2xl' : '',
    ]"
    :style="{ touchAction: bodyDrag ? 'none' : 'pan-y' }"
    @pointerdown="onBodyPointerDown"
  >
    <div
      class="ui-panel absolute top-2 left-1/2 flex max-w-[calc(100%-16px)] -translate-x-1/2 items-center gap-0.5 rounded-full! p-1"
    >
      <!-- Grip: the way to move a widget on touch screens, where dragging
           the card itself has to keep scrolling the page. -->
      <button
        type="button"
        class="ui-icon-button text-ink h-7 w-7 shrink-0 cursor-grab"
        style="touch-action: none"
        title="Drag to move"
        aria-label="Drag to move"
        @pointerdown.stop="emit('dragstart', $event)"
      >
        <AppIcon name="move" class="h-3.5 w-3.5" />
      </button>
      <span class="text-ink mr-1 min-w-0 truncate text-xs font-medium">
        {{ widgetName }}
      </span>
      <button
        v-for="action in actions"
        :key="action.event"
        type="button"
        class="ui-icon-button h-7 w-7 shrink-0"
        :class="
          action.event === 'remove'
            ? 'hover:bg-red-500/20! hover:text-red-400!'
            : ''
        "
        :title="action.label"
        :aria-label="action.label"
        @pointerdown.stop
        @click="onAction(action.event)"
      >
        <AppIcon :name="action.icon" class="h-3.5 w-3.5" />
      </button>
    </div>

    <div
      class="bg-accent text-accent-ink absolute right-2 bottom-2 flex h-8 w-8 cursor-nwse-resize items-center justify-center rounded-full shadow-lg"
      style="touch-action: none"
      title="Drag to resize"
      @pointerdown.stop="emit('resizestart', $event)"
    >
      <AppIcon name="resize" class="h-3.5 w-3.5" :stroke-width="2.2" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    widgetName: string
    dragging?: boolean
    /**
     * Whether dragging anywhere on the card moves it. Off on scrolling
     * grids for touch, so a swipe still scrolls; the mouse always can.
     */
    bodyDrag?: boolean
  }>(),
  { dragging: false, bodyDrag: true },
)

const emit = defineEmits<{
  dragstart: [event: PointerEvent]
  resizestart: [event: PointerEvent]
  fullscreen: []
  configure: []
  remove: []
}>()

const actions = [
  { event: 'fullscreen', label: 'Fullscreen', icon: 'expand' },
  { event: 'configure', label: 'Settings', icon: 'settings' },
  { event: 'remove', label: 'Remove', icon: 'trash' },
] as const

function onBodyPointerDown(event: PointerEvent) {
  if (props.bodyDrag || event.pointerType === 'mouse') emit('dragstart', event)
}

function onAction(event: (typeof actions)[number]['event']) {
  if (event === 'fullscreen') emit('fullscreen')
  else if (event === 'configure') emit('configure')
  else emit('remove')
}
</script>
