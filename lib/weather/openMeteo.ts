import type {
  Place,
  WeatherCondition,
  WeatherData,
  WeatherProvider,
} from './types'

// Open-Meteo (https://open-meteo.com): free, no API key, CORS-enabled.
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

/** Several widgets showing the same place share one request per window. */
const WEATHER_TTL_MS = 10 * 60_000

/** Maps a WMO weather interpretation code to our icon set. */
export function conditionFromWmo(code: number): WeatherCondition {
  if (code <= 1) return 'clear'
  if (code === 2) return 'partly-cloudy'
  if (code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if (code >= 95) return 'storm'
  if (code >= 51 && code <= 82) return 'rain'
  return 'cloudy'
}

interface GeocodingResponse {
  results?: { name: string; latitude: number; longitude: number }[]
}

interface ForecastResponse {
  current: {
    temperature_2m: number
    apparent_temperature: number
    weather_code: number
    is_day: number
  }
  daily: {
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
}

export function createOpenMeteoProvider(
  fetchFn: typeof fetch = (...args) => fetch(...args),
): WeatherProvider {
  const placeCache = new Map<string, Promise<Place | null>>()
  const weatherCache = new Map<
    string,
    { at: number; promise: Promise<WeatherData> }
  >()

  async function getJson<T>(url: string): Promise<T> {
    const response = await fetchFn(url)
    if (!response.ok)
      throw new Error(`Weather service error (${response.status})`)
    return (await response.json()) as T
  }

  function searchPlace(name: string): Promise<Place | null> {
    const key = name.trim().toLowerCase()
    if (!key) return Promise.resolve(null)
    let cached = placeCache.get(key)
    if (!cached) {
      const params = new URLSearchParams({
        name: name.trim(),
        count: '1',
        format: 'json',
        language:
          typeof navigator === 'undefined'
            ? 'en'
            : navigator.language.slice(0, 2),
      })
      cached = getJson<GeocodingResponse>(`${GEOCODING_URL}?${params}`).then(
        (data) => {
          const hit = data.results?.[0]
          return hit
            ? { name: hit.name, lat: hit.latitude, lon: hit.longitude }
            : null
        },
      )
      // Don't remember failures (e.g. offline), only real answers.
      cached.catch(() => placeCache.delete(key))
      placeCache.set(key, cached)
    }
    return cached
  }

  function getCurrentWeather(place: Place): Promise<WeatherData> {
    const key = `${place.lat.toFixed(2)},${place.lon.toFixed(2)}`
    const cached = weatherCache.get(key)
    if (cached && Date.now() - cached.at < WEATHER_TTL_MS) {
      return cached.promise.then((data) => ({
        ...data,
        locationName: place.name,
      }))
    }

    const params = new URLSearchParams({
      latitude: String(place.lat),
      longitude: String(place.lon),
      current: 'temperature_2m,apparent_temperature,weather_code,is_day',
      daily: 'temperature_2m_max,temperature_2m_min',
      timezone: 'auto',
      forecast_days: '1',
    })
    const promise = getJson<ForecastResponse>(`${FORECAST_URL}?${params}`).then(
      (data): WeatherData => ({
        locationName: place.name,
        temperatureC: data.current.temperature_2m,
        feelsLikeC: data.current.apparent_temperature,
        highC: data.daily.temperature_2m_max[0] ?? data.current.temperature_2m,
        lowC: data.daily.temperature_2m_min[0] ?? data.current.temperature_2m,
        condition: conditionFromWmo(data.current.weather_code),
        isDay: data.current.is_day === 1,
        fetchedAt: Date.now(),
      }),
    )
    promise.catch(() => weatherCache.delete(key))
    weatherCache.set(key, { at: Date.now(), promise })
    return promise
  }

  return { searchPlace, getCurrentWeather }
}

export const openMeteoProvider = createOpenMeteoProvider()
