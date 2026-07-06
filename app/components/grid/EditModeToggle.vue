<template>
  <button
    type="button"
    class="shadow-soft fixed top-4 right-4 z-20 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs backdrop-blur transition-colors"
    :class="
      editor.isEditing
        ? 'bg-accent-500 border-accent-500 text-surface-950'
        : 'bg-surface-900/80 border-white/5 text-surface-300 hover:text-surface-50'
    "
    @click="editor.toggleEditing()"
  >
    <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
      <path
        d="M4 20l1-4.5L16.5 3.5a1.5 1.5 0 0 1 2 0l1 1a1.5 1.5 0 0 1 0 2L8 18l-4 2Z"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linejoin="round"
      />
    </svg>
    {{ editor.isEditing ? 'Done' : 'Edit' }}
  </button>
</template>

<script setup lang="ts">
import { useEditorStore } from '~/stores/editor'

const editor = useEditorStore()
</script>
