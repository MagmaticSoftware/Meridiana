export type WeatherCondition =
  'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog'

export interface WeatherData {
  locationName: string
  temperatureC: number
  condition: WeatherCondition
}

export interface WeatherProvider {
  getCurrentWeather(location: string): Promise<WeatherData>
}
