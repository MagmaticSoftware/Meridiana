export type WeatherCondition =
  'clear' | 'partly-cloudy' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog'

export interface Place {
  name: string
  lat: number
  lon: number
}

export interface WeatherData {
  locationName: string
  temperatureC: number
  feelsLikeC: number
  highC: number
  lowC: number
  condition: WeatherCondition
  isDay: boolean
  /** When the provider fetched this, in ms since epoch. */
  fetchedAt: number
}

export interface WeatherProvider {
  /** Resolves a free-text place name; null if nothing matches. */
  searchPlace(name: string): Promise<Place | null>
  getCurrentWeather(place: Place): Promise<WeatherData>
}
