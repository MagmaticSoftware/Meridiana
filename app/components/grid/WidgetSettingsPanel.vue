<template>
  <Transition name="drawer">
    <div
      v-if="item && displayWidget"
      class="bg-surface-900/95 shadow-soft-lg border-surface-700 fixed top-4 right-4 bottom-4 z-30 w-72 overflow-y-auto rounded-2xl border p-4 backdrop-blur"
    >
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-surface-100 text-sm font-medium">
          {{ displayWidget.name }}
        </h2>
        <button
          type="button"
          class="text-surface-400 hover:text-surface-100 flex h-6 w-6 items-center justify-center rounded-full"
          aria-label="Close settings"
          @click="editor.selectItem(null)"
        >
          &times;
        </button>
      </div>

      <p
        v-if="displayWidget.settingsSchema.length === 0"
        class="text-surface-400 text-xs"
      >
        This widget has no configurable settings yet.
      </p>

      <div v-else class="space-y-4">
        <template
          v-for="field in displayWidget.settingsSchema"
          :key="field.key"
        >
          <label
            v-if="field.type === 'boolean'"
            class="flex items-center justify-between gap-2"
          >
            <span class="text-surface-300 text-xs">{{ field.label }}</span>
            <input
              type="checkbox"
              class="accent-accent-500 h-4 w-4"
              :checked="Boolean(valueFor(field))"
              @change="
                updateField(
                  field.key,
                  ($event.target as HTMLInputElement).checked,
                )
              "
            />
          </label>

          <label v-else class="block space-y-1.5">
            <span class="text-surface-300 text-xs">{{ field.label }}</span>

            <select
              v-if="field.type === 'select'"
              class="bg-surface-800 text-surface-100 w-full rounded-md px-2 py-1.5 text-sm"
              :value="valueFor(field)"
              @change="
                updateField(
                  field.key,
                  ($event.target as HTMLSelectElement).value,
                )
              "
            >
              <option
                v-for="option in field.options"
                :key="String(option.value)"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>

            <input
              v-else-if="field.type === 'number'"
              type="number"
              :min="field.min"
              :max="field.max"
              class="bg-surface-800 text-surface-100 w-full rounded-md px-2 py-1.5 text-sm"
              :value="valueFor(field)"
              @change="
                updateField(
                  field.key,
                  Number(($event.target as HTMLInputElement).value),
                )
              "
            />

            <input
              v-else
              type="text"
              class="bg-surface-800 text-surface-100 w-full rounded-md px-2 py-1.5 text-sm"
              :value="valueFor(field)"
              @change="
                updateField(
                  field.key,
                  ($event.target as HTMLInputElement).value,
                )
              "
            />
          </label>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLayoutStore } from '~/stores/layout'
import { useEditorStore } from '~/stores/editor'
import { useWidgetRegistry } from '~/composables/useWidgetRegistry'
import type {
  WidgetDefinition,
  WidgetSettingField,
  WidgetSettingValue,
} from '~~/lib/widgets/types'

const layout = useLayoutStore()
const editor = useEditorStore()
const { getWidget } = useWidgetRegistry()

const item = computed(() =>
  layout.items.find((candidate) => candidate.id === editor.selectedItemId),
)

const widget = computed(() =>
  item.value ? getWidget(item.value.widgetId) : undefined,
)

// Keep the last known widget around while the drawer's leave transition
// plays, so the settingsSchema list isn't ripped out mid-animation.
const displayWidget = ref<WidgetDefinition | undefined>(widget.value)
watch(widget, (next) => {
  if (next) displayWidget.value = next
})

function valueFor(field: WidgetSettingField): WidgetSettingValue {
  const current = item.value?.config[field.key]
  return current !== undefined ? (current as WidgetSettingValue) : field.default
}

function updateField(key: string, value: WidgetSettingValue) {
  if (!item.value) return
  layout.updateItem(item.value.id, {
    config: { ...item.value.config, [key]: value },
  })
}
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
</style>
