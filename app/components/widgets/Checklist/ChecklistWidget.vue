<template>
  <div
    class="flex h-full w-full flex-col gap-[0.6em] [container-type:size]"
    :style="{ fontSize: 'clamp(12px, min(5cqw, 9cqh), 22px)' }"
  >
    <header class="flex shrink-0 items-baseline justify-between">
      <h3 class="text-ink truncate text-[1.15em] font-semibold">{{ title }}</h3>
      <span
        v-if="items.length"
        class="text-ink-muted text-[0.85em] tabular-nums"
      >
        {{ doneCount }}/{{ items.length }}
      </span>
    </header>

    <ul class="-mx-[0.3em] min-h-0 flex-1 overflow-y-auto">
      <li
        v-for="item in items"
        :key="item.id"
        class="group hover:bg-tint flex items-center gap-[0.6em] rounded-[0.6em] px-[0.3em] py-[0.25em]"
      >
        <button
          type="button"
          class="flex h-[1.2em] w-[1.2em] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors"
          :class="
            item.done
              ? 'bg-accent border-accent text-accent-ink'
              : 'border-ink-subtle hover:border-accent'
          "
          :aria-label="item.done ? 'Mark as not done' : 'Mark as done'"
          @click="toggleItem(item.id)"
        >
          <AppIcon
            v-if="item.done"
            name="check"
            class="h-[0.8em] w-[0.8em]"
            :stroke-width="3"
          />
        </button>
        <span
          class="min-w-0 flex-1 truncate transition-colors"
          :class="item.done ? 'text-ink-subtle line-through' : 'text-ink'"
        >
          {{ item.text }}
        </span>
        <button
          type="button"
          class="text-ink-subtle hover:text-ink invisible shrink-0 group-hover:visible"
          aria-label="Remove task"
          @click="removeItem(item.id)"
        >
          <AppIcon name="close" class="h-[0.9em] w-[0.9em]" />
        </button>
      </li>
      <li
        v-if="items.length === 0"
        class="text-ink-subtle px-[0.3em] py-[0.25em]"
      >
        Nothing to do — enjoy the calm.
      </li>
    </ul>

    <form
      class="bg-tint focus-within:ring-accent/60 flex shrink-0 items-center gap-[0.4em] rounded-full py-[0.3em] pr-[0.3em] pl-[0.8em] focus-within:ring-1"
      @submit.prevent="addItem"
    >
      <input
        v-model="draft"
        type="text"
        placeholder="Add a task…"
        class="text-ink placeholder:text-ink-subtle min-w-0 flex-1 bg-transparent text-[0.9em] outline-none"
      />
      <button
        type="submit"
        class="bg-accent text-accent-ink flex h-[1.5em] w-[1.5em] shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-30"
        :disabled="!draft.trim()"
        aria-label="Add task"
      >
        <AppIcon name="plus" class="h-[0.9em] w-[0.9em]" :stroke-width="2.5" />
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChecklistItem } from './types'

const props = withDefaults(
  defineProps<{
    size?: { w: number; h: number }
    title?: string
    items?: ChecklistItem[]
  }>(),
  {
    size: () => ({ w: 1, h: 1 }),
    title: 'Tasks',
    items: () => [],
  },
)

const emit = defineEmits<{
  'update:config': [patch: { items: ChecklistItem[] }]
}>()

const draft = ref('')
const doneCount = computed(() => props.items.filter((item) => item.done).length)

function addItem() {
  const text = draft.value.trim()
  if (!text) return
  emit('update:config', {
    items: [...props.items, { id: crypto.randomUUID(), text, done: false }],
  })
  draft.value = ''
}

function toggleItem(id: string) {
  emit('update:config', {
    items: props.items.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item,
    ),
  })
}

function removeItem(id: string) {
  emit('update:config', {
    items: props.items.filter((item) => item.id !== id),
  })
}
</script>
