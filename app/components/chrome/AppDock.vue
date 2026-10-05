<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] z-30 flex justify-center px-4 transition-all duration-500 ease-(--ease-out-soft)"
    :class="hidden ? 'translate-y-6 opacity-0' : ''"
  >
    <nav
      class="ui-panel flex items-center gap-1 rounded-full! p-1.5"
      :class="hidden ? '' : 'pointer-events-auto'"
    >
      <!-- While editing, show which breakpoint's layout is being changed:
           each screen size keeps its own arrangement. -->
      <span
        v-if="editor.isEditing"
        class="text-ink-muted flex h-10 items-center gap-2 px-3.5 text-xs font-medium"
        :title="`Changes apply to the ${breakpoint} layout only`"
      >
        <AppIcon :name="breakpoint" class="h-4 w-4" />
        <span class="hidden capitalize sm:inline">{{ breakpoint }} layout</span>
      </span>
      <button
        v-else
        type="button"
        class="ui-icon-button h-10 gap-2 px-3.5 text-xs font-medium"
        :title="wakeLabel.long"
        :aria-label="wakeLabel.long"
        @click="emit('request-wake-lock')"
      >
        <span class="relative flex h-2 w-2">
          <span
            v-if="wakeLock.mode !== 'inactive'"
            class="absolute inset-0 animate-ping rounded-full bg-emerald-400/60 [animation-duration:2.5s]"
          />
          <span class="relative h-2 w-2 rounded-full" :class="wakeLabel.dot" />
        </span>
        <span class="hidden sm:inline">{{ wakeLabel.short }}</span>
      </button>

      <span class="bg-line mx-0.5 h-5 w-px" />

      <Transition name="pop">
        <button
          v-if="editor.isEditing"
          type="button"
          class="bg-accent text-accent-ink flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-transform hover:scale-[1.03] active:scale-95"
          aria-label="Add widget"
          @click="editor.togglePanel('picker')"
        >
          <AppIcon name="plus" class="h-4 w-4" :stroke-width="2.4" />
          <span class="hidden sm:inline">Add widget</span>
        </button>
      </Transition>

      <button
        type="button"
        class="flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors"
        :class="
          editor.isEditing
            ? 'bg-ink text-[var(--panel-bg)] hover:opacity-90'
            : 'text-ink-muted hover:bg-tint-strong hover:text-ink'
        "
        @click="editor.toggleEditing()"
      >
        <AppIcon
          :name="editor.isEditing ? 'check' : 'edit'"
          class="h-4 w-4"
          :stroke-width="editor.isEditing ? 2.4 : 1.75"
        />
        {{ editor.isEditing ? 'Done' : 'Edit' }}
      </button>

      <button
        type="button"
        class="ui-icon-button h-10 w-10"
        :class="
          editor.activePanel === 'settings' ? 'bg-tint-strong text-ink' : ''
        "
        aria-label="Settings"
        title="Appearance, background & layout"
        @click="editor.togglePanel('settings')"
      >
        <AppIcon name="palette" class="h-[18px] w-[18px]" />
      </button>
    </nav>
  </div>

  <!-- Popovers above the dock; clicking outside closes them. -->
  <div
    v-if="editor.activePanel"
    class="fixed inset-0 z-30"
    @click="editor.closePanel()"
  />
  <Transition name="sheet">
    <div
      v-if="editor.activePanel"
      class="ui-panel fixed bottom-[calc(max(16px,env(safe-area-inset-bottom))+68px)] left-1/2 z-30 flex max-h-[min(72vh,680px)] w-[min(420px,calc(100vw-24px))] -translate-x-1/2 flex-col overflow-hidden"
    >
      <WidgetPicker v-if="editor.activePanel === 'picker'" />
      <SettingsPanel v-else />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '~/stores/editor'
import { useBreakpoint } from '~/composables/useBreakpoint'
import type { WakeLockMode } from '~/composables/useWakeLock'

const props = defineProps<{
  hidden: boolean
  wakeLock: { mode: WakeLockMode; error: string | null }
}>()

const emit = defineEmits<{ 'request-wake-lock': [] }>()

const editor = useEditorStore()
const breakpoint = useBreakpoint()

const wakeLabel = computed(() => {
  const { mode, error } = props.wakeLock
  if (mode === 'native') {
    return {
      short: 'Awake',
      long: 'Screen kept awake (Wake Lock API)',
      dot: 'bg-emerald-400',
    }
  }
  if (mode === 'fallback') {
    return {
      short: 'Awake',
      long: 'Screen kept awake (video fallback)',
      dot: 'bg-emerald-400',
    }
  }
  return {
    short: 'Sleep allowed',
    long: `Screen may sleep${error ? ` — ${error}` : ''}. Tap to keep it awake.`,
    dot: error ? 'bg-red-400' : 'bg-ink-subtle',
  }
})
</script>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition:
    opacity 0.22s var(--ease-out-soft),
    transform 0.22s var(--ease-out-soft);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px) scale(0.98);
}
.pop-enter-active,
.pop-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s var(--ease-out-soft);
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
