<template>
  <p
    class="text-ink-muted shrink-0 truncate text-center text-[min(5.5cqw,8cqh)] leading-tight font-medium"
  >
    {{ label }}
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '~/composables/useNow'

const now = useNow('minute')

const label = computed(() =>
  now.value.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }),
)
</script>
