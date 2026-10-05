<template>
  <div class="space-y-2">
    <div v-if="selected.length" class="flex flex-wrap gap-1.5">
      <button
        v-for="option in selected"
        :key="option.value"
        type="button"
        class="bg-accent text-accent-ink flex items-center gap-1 rounded-full py-1 pr-2 pl-3 text-xs font-medium"
        :aria-label="`Remove ${option.label}`"
        @click="toggle(option.value)"
      >
        {{ option.label }}
        <AppIcon name="close" class="h-3 w-3" :stroke-width="2.4" />
      </button>
    </div>
    <input
      v-model="query"
      type="search"
      placeholder="Search…"
      class="ui-input"
    />
    <div class="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
      <button
        v-for="option in available"
        :key="option.value"
        type="button"
        class="bg-tint text-ink-muted hover:bg-tint-strong hover:text-ink flex items-center gap-1 rounded-full py-1 pr-3 pl-2 text-xs font-medium transition-colors"
        @click="toggle(option.value)"
      >
        <AppIcon name="plus" class="h-3 w-3" :stroke-width="2.4" />
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  modelValue: string[]
  options: { label: string; value: string }[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const query = ref('')

// Selected values keep the order they were picked in.
const selected = computed(() =>
  props.modelValue
    .map((value) => props.options.find((option) => option.value === value))
    .filter((option) => option !== undefined),
)

const available = computed(() => {
  const q = query.value.trim().toLowerCase()
  return props.options.filter(
    (option) =>
      !props.modelValue.includes(option.value) &&
      (!q || option.label.toLowerCase().includes(q)),
  )
})

function toggle(value: string) {
  emit(
    'update:modelValue',
    props.modelValue.includes(value)
      ? props.modelValue.filter((v) => v !== value)
      : [...props.modelValue, value],
  )
}
</script>
