import { onMounted, onUnmounted, readonly, ref } from 'vue'

export type WakeLockMode = 'native' | 'fallback' | 'inactive'

export function useWakeLock() {
  const isSupported = import.meta.client && 'wakeLock' in navigator
  const mode = ref<WakeLockMode>('inactive')
  const error = ref<string | null>(null)

  let sentinel: WakeLockSentinel | null = null
  let fallbackVideo: HTMLVideoElement | null = null
  let wanted = false

  async function requestNative(): Promise<boolean> {
    try {
      sentinel = await navigator.wakeLock.request('screen')
      sentinel.addEventListener('release', () => {
        if (mode.value === 'native') mode.value = 'inactive'
      })
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      return false
    }
  }

  function startFallback() {
    if (fallbackVideo) return

    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    ctx?.fillRect(0, 0, 1, 1)

    if (typeof canvas.captureStream !== 'function') {
      error.value = 'No wake lock fallback available in this browser.'
      return
    }

    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.setAttribute('aria-hidden', 'true')
    video.style.position = 'fixed'
    video.style.width = '1px'
    video.style.height = '1px'
    video.style.opacity = '0'
    video.style.pointerEvents = 'none'
    video.srcObject = canvas.captureStream(1)
    document.body.appendChild(video)

    video.play().catch((err) => {
      error.value = err instanceof Error ? err.message : String(err)
    })

    fallbackVideo = video
    mode.value = 'fallback'
    error.value = null
  }

  function stopFallback() {
    if (!fallbackVideo) return
    fallbackVideo.pause()
    fallbackVideo.remove()
    fallbackVideo = null
  }

  async function request() {
    wanted = true
    error.value = null

    if (isSupported) {
      const ok = await requestNative()
      if (ok) {
        mode.value = 'native'
        return
      }
    }
    startFallback()
  }

  async function release() {
    wanted = false
    if (sentinel) {
      await sentinel.release().catch(() => {})
      sentinel = null
    }
    stopFallback()
    mode.value = 'inactive'
  }

  function handleVisibilityChange() {
    if (
      document.visibilityState === 'visible' &&
      wanted &&
      mode.value === 'inactive'
    ) {
      request()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    release()
  })

  return {
    isSupported,
    mode: readonly(mode),
    error: readonly(error),
    request,
    release,
  }
}
