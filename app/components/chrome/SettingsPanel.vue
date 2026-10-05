<template>
  <div class="flex min-h-0 flex-col">
    <div class="p-3 pb-0">
      <UiSegmented v-model="tab" :options="tabs" />
    </div>
    <div class="min-h-0 overflow-y-auto p-5 pt-4">
      <AppearanceSettings v-if="tab === 'appearance'" />
      <BackgroundSettings v-else-if="tab === 'background'" />
      <LayoutSettings v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type Tab = 'appearance' | 'background' | 'layout'

const tabs: { label: string; value: Tab }[] = [
  { label: 'Appearance', value: 'appearance' },
  { label: 'Background', value: 'background' },
  { label: 'Layout', value: 'layout' },
]

const tab = ref<Tab>('appearance')
</script>
