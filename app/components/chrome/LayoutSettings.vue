<template>
  <div class="space-y-5">
    <section class="space-y-2">
      <h3 class="ui-label">Share</h3>
      <p class="text-ink-muted text-xs">
        Save your widgets and their settings as a JSON file, or load one.
      </p>
      <div class="grid grid-cols-2 gap-2">
        <button type="button" :class="buttonClass" @click="exportFile">
          <AppIcon name="download" class="h-4 w-4" /> Export
        </button>
        <label :class="buttonClass" class="cursor-pointer">
          <AppIcon name="upload" class="h-4 w-4" /> Import
          <input
            type="file"
            accept="application/json,.json"
            class="hidden"
            @change="importFile"
          />
        </label>
      </div>
      <p
        v-if="message"
        class="text-xs"
        :class="message.error ? 'text-red-400' : 'text-ink-muted'"
      >
        {{ message.text }}
      </p>
    </section>

    <section v-if="breakpoint !== 'desktop'" class="space-y-2">
      <h3 class="ui-label">This screen</h3>
      <p class="text-ink-muted text-xs">
        Each screen size keeps its own arrangement. Re-flowing the
        {{ breakpoint }} layout rebuilds it from the desktop one.
      </p>
      <button
        type="button"
        :class="buttonClass"
        class="w-full"
        @click="layout.resetBreakpoint(breakpoint as 'phone' | 'tablet')"
      >
        <AppIcon :name="breakpoint" class="h-4 w-4" />
        Re-flow {{ breakpoint }} layout
      </button>
    </section>

    <section class="space-y-2">
      <h3 class="ui-label">Reset</h3>
      <button type="button" :class="buttonClass" class="w-full" @click="reset">
        <AppIcon name="reset" class="h-4 w-4" />
        {{
          confirmReset
            ? 'Tap again to restore the default layout'
            : 'Restore default layout'
        }}
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLayoutStore } from '~/stores/layout'
import { useBreakpoint } from '~/composables/useBreakpoint'

const layout = useLayoutStore()
const breakpoint = useBreakpoint()
const message = ref<{ text: string; error: boolean } | null>(null)
const confirmReset = ref(false)

const buttonClass =
  'bg-tint hover:bg-tint-strong text-ink flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors'

function exportFile() {
  const blob = new Blob([layout.exportLayout()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'meridiana-layout.json'
  link.click()
  URL.revokeObjectURL(url)
  message.value = { text: 'Layout exported.', error: false }
}

async function importFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    layout.importLayout(await file.text())
    message.value = { text: 'Layout imported.', error: false }
  } catch (err) {
    message.value = {
      text: `Couldn’t import: ${err instanceof Error ? err.message : String(err)}`,
      error: true,
    }
  }
}

function reset() {
  if (!confirmReset.value) {
    confirmReset.value = true
    setTimeout(() => (confirmReset.value = false), 4000)
    return
  }
  layout.resetLayout()
  confirmReset.value = false
  message.value = null
}
</script>
