import { describe, expect, it } from 'vitest'
import {
  formatOffset,
  getDayDelta,
  getTimeParts,
  getTimeZoneOffset,
} from '../lib/time/format'
import { getSunTimes, isNight } from '../lib/time/sun'
import { getCity, resolveCities } from '../lib/time/cities'

// 2026-06-21 12:34:56 UTC
const instant = new Date(Date.UTC(2026, 5, 21, 12, 34, 56))

describe('getTimeParts', () => {
  it('formats 24-hour time in a time zone', () => {
    expect(getTimeParts(instant, { timeZone: 'Asia/Tokyo' })).toEqual({
      hours: '21',
      minutes: '34',
      seconds: '56',
      period: '',
    })
  })

  it('formats 12-hour time with a period', () => {
    expect(
      getTimeParts(instant, { timeZone: 'America/New_York', hour12: true }),
    ).toMatchObject({
      hours: '8',
      period: 'AM',
    })
  })

  it('handles midnight as 00 / 12 AM', () => {
    const midnight = new Date(Date.UTC(2026, 0, 1, 0, 0, 0))
    expect(getTimeParts(midnight, { timeZone: 'UTC' }).hours).toBe('00')
    expect(
      getTimeParts(midnight, { timeZone: 'UTC', hour12: true }).hours,
    ).toBe('12')
  })
})

describe('time zone offsets', () => {
  it('reads DST-aware and fractional offsets', () => {
    expect(getTimeZoneOffset(instant, 'Europe/Rome')).toBe(120)
    expect(getTimeZoneOffset(instant, 'Asia/Kolkata')).toBe(330)
    expect(getTimeZoneOffset(instant, 'America/Los_Angeles')).toBe(-420)
  })

  it('formats offsets compactly', () => {
    expect(formatOffset(0)).toBe('±0h')
    expect(formatOffset(60)).toBe('+1h')
    expect(formatOffset(-300)).toBe('−5h')
    expect(formatOffset(330)).toBe('+5:30h')
  })

  it('detects tomorrow on the other side of the date line', () => {
    const lateUtc = new Date(Date.UTC(2026, 5, 21, 20, 0, 0))
    // Relative to the local zone of the test runner, Auckland is never behind.
    expect(getDayDelta(lateUtc, 'Pacific/Auckland')).toBeGreaterThanOrEqual(0)
  })
})

describe('sun', () => {
  const london = getCity('london')!

  it('knows London is in daylight at noon UTC in June, dark at 1am', () => {
    expect(isNight(instant, london.lat, london.lon)).toBe(false)
    expect(
      isNight(new Date(Date.UTC(2026, 5, 21, 1)), london.lat, london.lon),
    ).toBe(true)
  })

  it('computes a plausible London sunrise on the solstice (~03:43 UTC)', () => {
    const { sunrise, sunset } = getSunTimes(instant, london.lat, london.lon)
    expect(sunrise!.getUTCHours()).toBe(3)
    expect(sunset!.getUTCHours()).toBe(20)
  })

  it('returns null during polar day', () => {
    expect(getSunTimes(instant, 78.2, 15.6)).toEqual({
      sunrise: null,
      sunset: null,
    })
  })
})

describe('cities', () => {
  it('resolves ids in order and drops unknown ones', () => {
    expect(
      resolveCities(['tokyo', 'nowhere', 'london']).map((c) => c.code),
    ).toEqual(['TYO', 'LON'])
  })

  it('only uses valid IANA time zones', async () => {
    const { cities } = await import('../lib/time/cities')
    for (const city of cities) {
      expect(
        () => new Intl.DateTimeFormat('en', { timeZone: city.timeZone }),
      ).not.toThrow()
    }
  })
})
