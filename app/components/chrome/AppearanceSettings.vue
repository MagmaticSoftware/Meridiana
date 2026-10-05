<template>
  <div class="space-y-5">
    <section class="space-y-2">
      <h3 class="ui-label">Cards</h3>
      <UiSegmented
        v-model="appearance.tone"
        :options="[
          { label: 'Dark', value: 'dark' },
          { label: 'Light', value: 'light' },
        ]"
      />
      <UiSegmented
        v-model="appearance.material"
        :options="[
          { label: 'Glass', value: 'glass' },
          { label: 'Solid', value: 'solid' },
        ]"
      />
    </section>

    <section class="space-y-2">
      <h3 class="ui-label">Accent</h3>
      <div class="flex flex-wrap gap-2.5">
        <button
          v-for="accent in accents"
          :key="accent.id"
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full ring-offset-2 ring-offset-[var(--panel-bg)] transition-transform hover:scale-110"
          :class="
            appearance.accentId === accent.id ? 'ring-2 ring-[var(--ink)]' : ''
          "
          :style="{ background: accent.color, color: accent.onColor }"
          :title="accent.name"
          :aria-label="accent.name"
          @click="appearance.accentId = accent.id"
        >
          <AppIcon
            v-if="appearance.accentId === accent.id"
            name="check"
            class="h-4 w-4"
            :stroke-width="2.6"
          />
        </button>
      </div>
    </section>

    <section>
      <h3 class="ui-label mb-1">Screensaver</h3>
      <UiRow label="Hide controls when idle">
        <UiSwitch v-model="appearance.autoHideControls" />
      </UiRow>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAppearanceStore } from '~/stores/appearance'
import { accents } from '~~/lib/theme/accents'

const appearance = useAppearanceStore()
</script>
