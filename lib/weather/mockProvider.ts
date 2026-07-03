import type { WeatherCondition, WeatherData, WeatherProvider } from './types'

const conditions: WeatherCondition[] = [
  'clear',
  'cloudy',
  'rain',
  'snow',
  'storm',
  'fog',
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export const mockWeatherProvider: WeatherProvider = {
  async getCurrentWeather(location: string): Promise<WeatherData> {
    const seed = hashString(location || 'default')
    return {
      locationName: location || 'Unknown',
      temperatureC: 8 + (seed % 22),
      condition: conditions[seed % conditions.length] as WeatherCondition,
    }
  },
}
