<template>
  <div
    class="border-accent-400/60 bg-surface-950/20 absolute inset-0 rounded-xl border-2 border-dashed"
    :class="dragging ? 'cursor-grabbing' : 'cursor-grab'"
    @pointerdown="onBodyPointerDown"
  >
    <div
      class="absolute inset-x-2 top-2 flex items-start justify-between gap-1"
    >
      <span
        class="bg-surface-900/80 text-surface-300 pointer-events-none min-w-0 truncate rounded-full px-2 py-0.5 text-[11px] backdrop-blur"
      >
        {{ widgetName }}
      </span>

      <div class="flex shrink-0 gap-1">
        <button
          type="button"
          class="bg-surface-900/80 text-surface-300 hover:text-surface-50 hover:bg-surface-800 flex h-7 w-7 shrink-0 items-center justify-center rounded-full backdrop-blur"
          title="Fullscreen"
          @pointerdown.stop
          @click="$emit('fullscreen')"
        >
          <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
            <path
              d="M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          class="bg-surface-900/80 text-surface-300 hover:text-surface-50 hover:bg-surface-800 flex h-7 w-7 shrink-0 items-center justify-center rounded-full backdrop-blur"
          title="Settings"
          @pointerdown.stop
          @click="$emit('configure')"
        >
          <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
            <circle
              cx="12"
              cy="12"
              r="2.6"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <path
              d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <button
          type="button"
          class="bg-surface-900/80 text-surface-300 hover:text-surface-50 hover:bg-red-900/60 flex h-7 w-7 shrink-0 items-center justify-center rounded-full backdrop-blur"
          title="Remove"
          @pointerdown.stop
          @click="$emit('remove')"
        >
          <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <div
      class="text-surface-300 bg-surface-900/80 absolute right-2 bottom-2 flex h-7 w-7 cursor-nwse-resize items-center justify-center rounded-full backdrop-blur"
      @pointerdown.stop="onResizePointerDown"
    >
      <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
        <path
          d="M18 6 6 18M18 12l-6 6M18 18h-2"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  widgetName: string
  dragging?: boolean
}>()

const emit = defineEmits<{
  dragstart: [event: PointerEvent]
  resizestart: [event: PointerEvent]
  fullscreen: []
  configure: []
  remove: []
}>()

function onBodyPointerDown(event: PointerEvent) {
  emit('dragstart', event)
}

function onResizePointerDown(event: PointerEvent) {
  emit('resizestart', event)
}
</script>
