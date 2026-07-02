<template>
  <div
    class="bg-surface-900 shadow-soft relative h-[min(70cqh,20cqw)] w-[min(52cqh,15cqw)] overflow-hidden rounded-md [perspective:400px]"
  >
    <Transition name="flip">
      <span
        :key="digit"
        class="font-display text-surface-50 absolute inset-0 flex items-center justify-center text-[min(45cqh,13cqw)] font-medium tabular-nums"
      >
        {{ digit }}
      </span>
    </Transition>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  digit: string
}>()
</script>

<style scoped>
.flip-enter-active,
.flip-leave-active {
  transition:
    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.4s ease;
  backface-visibility: hidden;
}
.flip-enter-from {
  transform: rotateX(-100deg);
  opacity: 0;
}
.flip-leave-to {
  transform: rotateX(100deg);
  opacity: 0;
}
</style>
