import { onMounted, onUnmounted, readonly, ref } from 'vue'

const ACTIVITY_EVENTS = [
  'pointermove',
  'pointerdown',
  'keydown',
  'wheel',
  'touchstart',
] as const

/** `idle` turns true after `timeoutMs` without any user input. */
export function useIdle(timeoutMs = 4000) {
  const idle = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  function onActivity() {
    idle.value = false
    clearTimeout(timer)
    timer = setTimeout(() => (idle.value = true), timeoutMs)
  }

  onMounted(() => {
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true })
    }
    onActivity()
  })

  onUnmounted(() => {
    for (const event of ACTIVITY_EVENTS) {
      window.removeEventListener(event, onActivity)
    }
    clearTimeout(timer)
  })

  return readonly(idle)
}
