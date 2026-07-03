<template>
  <div
    class="flex h-full w-full flex-col gap-[2cqh] overflow-hidden p-[4cqmin] [container-type:size]"
  >
    <form class="flex gap-2" @submit.prevent="addItem">
      <input
        v-model="draft"
        type="text"
        placeholder="Add a task…"
        class="border-surface-600 text-surface-100 placeholder:text-surface-500 flex-1 rounded-md border bg-transparent px-2 py-1 text-[min(5cqw,6cqh)] outline-none"
      />
    </form>
    <ul class="flex flex-1 flex-col gap-[1cqh] overflow-y-auto">
      <li
        v-for="item in items"
        :key="item.id"
        class="group flex items-center gap-2"
      >
        <input
          type="checkbox"
          :checked="item.done"
          @change="toggleItem(item.id)"
        />
        <span
          class="text-surface-100 flex-1 text-[min(5cqw,6cqh)]"
          :class="{ 'text-surface-500 line-through': item.done }"
        >
          {{ item.text }}
        </span>
        <button
          type="button"
          class="text-surface-500 hidden text-xs group-hover:block"
          @click="removeItem(item.id)"
        >
          &times;
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ChecklistItem } from './types'

const props = withDefaults(
  defineProps<{
    size?: { w: number; h: number }
    items?: ChecklistItem[]
  }>(),
  {
    size: () => ({ w: 1, h: 1 }),
    items: () => [],
  },
)

const emit = defineEmits<{
  'update:config': [patch: { items: ChecklistItem[] }]
}>()

const draft = ref('')

function addItem() {
  const text = draft.value.trim()
  if (!text) return
  const next: ChecklistItem[] = [
    ...props.items,
    { id: crypto.randomUUID(), text, done: false },
  ]
  emit('update:config', { items: next })
  draft.value = ''
}

function toggleItem(id: string) {
  const next = props.items.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item,
  )
  emit('update:config', { items: next })
}

function removeItem(id: string) {
  const next = props.items.filter((item) => item.id !== id)
  emit('update:config', { items: next })
}
</script>
