<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    class="relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200"
    :class="modelValue ? 'bg-accent' : 'bg-tint-strong'"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span
      class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-(--ease-out-soft)"
      :class="modelValue ? 'translate-x-4' : 'translate-x-0'"
    />
  </button>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>
