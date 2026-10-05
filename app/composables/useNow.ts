import { getCurrentScope, onScopeDispose, shallowRef, watch } from 'vue'
import type { Ref } from 'vue'

// One ticker for the whole app, aligned to the wall-clock second so every
// clock flips at the same instant, and stopped when nothing is listening.
const now = shallowRef(new Date())
let subscribers = 0
let timer: ReturnType<typeof setTimeout> | undefined

function schedule() {
  timer = setTimeout(
    () => {
      now.value = new Date()
      schedule()
    },
    1000 - (Date.now() % 1000) + 5,
  )
}

function subscribe() {
  if (!import.meta.client) return
  if (subscribers++ === 0) {
    now.value = new Date()
    schedule()
  }
  if (getCurrentScope()) {
    onScopeDispose(() => {
      if (--subscribers === 0) clearTimeout(timer)
    })
  }
}

/**
 * A reactive `Date` shared by every widget. `'minute'` only changes when
 * the minute does, for widgets that don't need to re-render every second.
 */
export function useNow(
  precision: 'second' | 'minute' = 'second',
): Readonly<Ref<Date>> {
  subscribe()
  if (precision === 'second') return now

  const minute = shallowRef(now.value)
  watch(now, (date) => {
    if (
      Math.floor(date.getTime() / 60_000) !==
      Math.floor(minute.value.getTime() / 60_000)
    ) {
      minute.value = date
    }
  })
  return minute
}
