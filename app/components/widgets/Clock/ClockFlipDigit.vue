<template>
  <div
    class="bg-tint-strong text-ink relative h-[1.04em] w-[0.72em] overflow-hidden rounded-[0.12em] shadow-[0_0.04em_0.12em_rgb(0_0_0/0.25)] [perspective:4em]"
  >
    <Transition name="flip">
      <span
        :key="digit"
        class="font-display absolute inset-0 flex items-center justify-center text-[0.8em] leading-none font-semibold tabular-nums"
      >
        {{ digit }}
      </span>
    </Transition>
    <!-- The hinge: a hairline split across the middle of the card. -->
    <span
      class="absolute inset-x-0 top-1/2 h-[0.015em] min-h-px -translate-y-1/2 bg-black/25"
    />
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
    transform 0.45s cubic-bezier(0.3, 0, 0.2, 1),
    opacity 0.45s ease;
  backface-visibility: hidden;
}
.flip-enter-from {
  transform: rotateX(-90deg);
  transform-origin: 50% 0%;
  opacity: 0;
}
.flip-leave-to {
  transform: rotateX(90deg);
  transform-origin: 50% 100%;
  opacity: 0;
}
</style>
