<template>
  <Transition name="drawer">
    <aside
      v-if="item && displayWidget"
      class="ui-panel fixed top-[max(16px,env(safe-area-inset-top))] right-4 bottom-4 z-30 flex w-[min(340px,calc(100vw-32px))] flex-col overflow-hidden"
    >
      <header class="flex items-center gap-3 px-5 pt-5 pb-4">
        <span
          class="bg-accent/15 text-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        >
          <AppIcon :name="displayWidget.icon" class="h-5 w-5" />
        </span>
        <h2 class="text-ink min-w-0 flex-1 truncate text-base font-semibold">
          {{ displayWidget.name }}
        </h2>
        <button
          type="button"
          class="ui-icon-button h-8 w-8"
          aria-label="Close settings"
          @click="editor.selectItem(null)"
        >
          <AppIcon name="close" class="h-4 w-4" />
        </button>
      </header>

      <div class="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pb-5">
        <section class="space-y-2">
          <h3 class="ui-label">Frame</h3>
          <UiSegmented
            :model-value="item.frame ?? 'card'"
            :options="[
              { label: 'Card', value: 'card' },
              { label: 'Transparent', value: 'clear' },
            ]"
            @update:model-value="
              (frame) => layout.updateItem(item!.id, { frame })
            "
          />
        </section>

        <template
          v-for="field in displayWidget.settingsSchema"
          :key="field.key"
        >
          <UiRow v-if="field.type === 'boolean'" :label="field.label">
            <UiSwitch
              :model-value="Boolean(valueFor(field))"
              @update:model-value="(value) => updateField(field.key, value)"
            />
          </UiRow>

          <section v-else class="space-y-2">
            <h3 class="ui-label">{{ field.label }}</h3>

            <template v-if="field.type === 'select'">
              <UiSegmented
                v-if="(field.options?.length ?? 0) <= 3"
                :model-value="valueFor(field) as string"
                :options="
                  (field.options ?? []) as { label: string; value: string }[]
                "
                @update:model-value="(value) => updateField(field.key, value)"
              />
              <div v-else class="grid grid-cols-3 gap-1.5">
                <button
                  v-for="option in field.options"
                  :key="String(option.value)"
                  type="button"
                  class="rounded-xl px-2 py-2 text-xs font-medium transition-colors"
                  :class="
                    option.value === valueFor(field)
                      ? 'bg-accent text-accent-ink'
                      : 'bg-tint text-ink-muted hover:bg-tint-strong hover:text-ink'
                  "
                  @click="updateField(field.key, option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </template>

            <MultiSelectField
              v-else-if="field.type === 'multiselect'"
              :model-value="valueFor(field) as string[]"
              :options="
                (field.options ?? []) as { label: string; value: string }[]
              "
              @update:model-value="(value) => updateField(field.key, value)"
            />

            <input
              v-else-if="field.type === 'number'"
              type="number"
              :min="field.min"
              :max="field.max"
              class="ui-input"
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
              class="ui-input"
              :value="valueFor(field)"
              @change="
                updateField(
                  field.key,
                  ($event.target as HTMLInputElement).value,
                )
              "
            />
          </section>
        </template>
      </div>
    </aside>
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
  if (item.value) layout.updateConfig(item.value.id, { [key]: value })
}
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition:
    opacity 0.25s var(--ease-out-soft),
    transform 0.25s var(--ease-out-soft);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
