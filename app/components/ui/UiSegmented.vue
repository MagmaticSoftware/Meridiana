<template>
  <div class="bg-tint flex rounded-xl p-1" role="radiogroup">
    <button
      v-for="option in options"
      :key="String(option.value)"
      type="button"
      role="radio"
      :aria-checked="option.value === modelValue"
      class="flex-1 rounded-[0.6rem] px-2 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200"
      :class="
        option.value === modelValue
          ? 'bg-tint-strong text-ink shadow-sm'
          : 'text-ink-muted hover:text-ink'
      "
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number | boolean">
defineProps<{
  modelValue: T
  options: { label: string; value: T }[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: T] }>()
</script>
