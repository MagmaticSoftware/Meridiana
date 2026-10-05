import { describe, expect, it, vi } from 'vitest'
import {
  conditionFromWmo,
  createOpenMeteoProvider,
} from '../lib/weather/openMeteo'

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }))
}

const forecast = {
  current: {
    temperature_2m: 15.6,
    apparent_temperature: 14.1,
    weather_code: 3,
    is_day: 0,
  },
  daily: { temperature_2m_max: [24], temperature_2m_min: [15] },
}

describe('conditionFromWmo', () => {
  it.each([
    [0, 'clear'],
    [2, 'partly-cloudy'],
    [3, 'cloudy'],
    [45, 'fog'],
    [61, 'rain'],
    [81, 'rain'],
    [73, 'snow'],
    [86, 'snow'],
    [95, 'storm'],
  ])('code %i → %s', (code, condition) => {
    expect(conditionFromWmo(code)).toBe(condition)
  })
})

describe('Open-Meteo provider', () => {
  it('geocodes a place name and caches the answer', async () => {
    const fetchFn = vi.fn(() =>
      jsonResponse({
        results: [{ name: 'Milan', latitude: 45.46, longitude: 9.19 }],
      }),
    )
    const provider = createOpenMeteoProvider(fetchFn)
    expect(await provider.searchPlace('Milan')).toEqual({
      name: 'Milan',
      lat: 45.46,
      lon: 9.19,
    })
    await provider.searchPlace(' milan ')
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('returns null for unknown places', async () => {
    const provider = createOpenMeteoProvider(() => jsonResponse({}))
    expect(await provider.searchPlace('Nowhereville')).toBeNull()
  })

  it('maps the forecast and shares one request per place', async () => {
    const fetchFn = vi.fn(() => jsonResponse(forecast))
    const provider = createOpenMeteoProvider(fetchFn)
    const place = { name: 'Milan', lat: 45.46, lon: 9.19 }
    const data = await provider.getCurrentWeather(place)
    expect(data).toMatchObject({
      locationName: 'Milan',
      temperatureC: 15.6,
      feelsLikeC: 14.1,
      highC: 24,
      lowC: 15,
      condition: 'cloudy',
      isDay: false,
    })
    await provider.getCurrentWeather({ ...place, name: 'Milano' })
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('surfaces HTTP errors and retries afterwards', async () => {
    const fetchFn = vi
      .fn()
      .mockImplementationOnce(() => jsonResponse({}, 503))
      .mockImplementation(() => jsonResponse(forecast))
    const provider = createOpenMeteoProvider(fetchFn)
    const place = { name: 'Milan', lat: 45.46, lon: 9.19 }
    await expect(provider.getCurrentWeather(place)).rejects.toThrow('503')
    await expect(provider.getCurrentWeather(place)).resolves.toMatchObject({
      temperatureC: 15.6,
    })
  })
})
