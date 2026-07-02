<template>
  <div
    class="grid h-full w-full gap-6 p-8"
    :style="{
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
    }"
  >
    <div
      v-for="item in layout.items"
      :key="item.id"
      :style="{
        gridColumn: `${item.x + 1} / span ${item.w}`,
        gridRow: `${item.y + 1} / span ${item.h}`,
      }"
    >
      <component
        :is="getWidget(item.widgetId)!.component"
        v-if="getWidget(item.widgetId)"
        :size="{ w: item.w, h: item.h }"
        v-bind="item.config"
      />
      <WidgetPlaceholder v-else :widget-id="item.widgetId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLayoutStore } from '~/stores/layout'

const columns = 6
const rows = 4

const layout = useLayoutStore()
const { getWidget } = useWidgetRegistry()
</script>
