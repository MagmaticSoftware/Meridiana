import { ref, watch } from 'vue'
import { mockWeatherProvider } from '~~/lib/weather/mockProvider'
import type { WeatherData } from '~~/lib/weather/types'

export function useWeather(location: () => string) {
  const data = ref<WeatherData | null>(null)
  const loading = ref(true)

  async function load() {
    loading.value = true
    data.value = await mockWeatherProvider.getCurrentWeather(location())
    loading.value = false
  }

  watch(location, load, { immediate: true })

  return { data, loading }
}
