import { onMounted, onUnmounted, ref, watch } from 'vue'
import { openMeteoProvider } from '~~/lib/weather/openMeteo'
import type { Place, WeatherData } from '~~/lib/weather/types'

const REFRESH_MS = 15 * 60_000
const CACHE_PREFIX = 'weather:'

export interface WeatherSource {
  location: string
  useDeviceLocation: boolean
}

function readCache(key: string): WeatherData | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    return raw ? (JSON.parse(raw) as WeatherData) : null
  } catch {
    return null
  }
}

function writeCache(key: string, data: WeatherData) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data))
  } catch {
    // Storage full or blocked: caching is best-effort.
  }
}

function getDevicePlace(): Promise<Place> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Location isn’t available on this device.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          name: 'My location',
          lat: coords.latitude,
          lon: coords.longitude,
        }),
      () => reject(new Error('Location permission denied.')),
      { timeout: 15_000, maximumAge: 30 * 60_000 },
    )
  })
}

/**
 * Current weather for a place name (or the device location), refreshed
 * every 15 minutes. The last good result is kept in localStorage so the
 * widget still shows something offline, flagged as `stale`.
 */
export function useWeather(source: () => WeatherSource) {
  const data = ref<WeatherData | null>(null)
  const error = ref<string | null>(null)
  const stale = ref(false)
  const loading = ref(false)
  let timer: ReturnType<typeof setInterval> | undefined
  let requestId = 0
  let currentKey: string | null = null

  function cacheKey(src: WeatherSource) {
    return src.useDeviceLocation ? '@device' : src.location.trim().toLowerCase()
  }

  async function load() {
    const id = ++requestId
    const src = source()
    const key = cacheKey(src)

    // New place: show its last cached reading while the fresh one loads.
    if (key !== currentKey) {
      currentKey = key
      data.value = readCache(key)
      stale.value = data.value !== null
    }

    if (!src.useDeviceLocation && !src.location.trim()) {
      data.value = null
      error.value = 'Set a location in the widget settings.'
      return
    }

    loading.value = true
    try {
      const place = src.useDeviceLocation
        ? await getDevicePlace()
        : await openMeteoProvider.searchPlace(src.location)
      if (!place) throw new Error(`Couldn’t find “${src.location}”.`)
      const result = await openMeteoProvider.getCurrentWeather(place)
      if (id !== requestId) return
      data.value = result
      stale.value = false
      error.value = null
      writeCache(key, result)
    } catch (err) {
      if (id !== requestId) return
      error.value = err instanceof Error ? err.message : 'Weather unavailable.'
      stale.value = data.value !== null
    } finally {
      if (id === requestId) loading.value = false
    }
  }

  function onOnline() {
    if (stale.value || error.value) load()
  }

  watch(source, load, { immediate: true, deep: true })

  onMounted(() => {
    timer = setInterval(load, REFRESH_MS)
    window.addEventListener('online', onOnline)
  })

  onUnmounted(() => {
    clearInterval(timer)
    window.removeEventListener('online', onOnline)
  })

  return { data, error, stale, loading }
}
