<template>
  <div
    class="h-full w-full overflow-hidden p-[clamp(12px,6cqmin,30px)]"
    :class="frame === 'clear' ? 'frame-clear' : 'widget-card'"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { WidgetFrame } from '~~/lib/grid/layout'

defineProps<{ frame: WidgetFrame }>()
</script>
