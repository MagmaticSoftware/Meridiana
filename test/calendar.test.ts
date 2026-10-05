import { describe, expect, it } from 'vitest'
import {
  buildMonthGrid,
  getIsoWeekNumber,
  getWeekdayLabels,
} from '../lib/time/calendar'

describe('getIsoWeekNumber', () => {
  it.each([
    ['2026-01-01', 1],
    ['2021-01-03', 53], // Sunday belongs to the last week of 2020
    ['2026-10-05', 41],
    ['2024-12-30', 1], // Monday already in week 1 of 2025
  ])('%s → week %i', (iso, week) => {
    const [y, m, d] = iso.split('-').map(Number) as [number, number, number]
    expect(getIsoWeekNumber(new Date(y, m - 1, d))).toBe(week)
  })
})

describe('buildMonthGrid', () => {
  const today = new Date(2019, 3, 3) // the reference design: April 3, 2019

  it('always returns 6 weeks of 7 days', () => {
    const weeks = buildMonthGrid(2019, 3, 'monday', today)
    expect(weeks).toHaveLength(6)
    expect(weeks.every((week) => week.days.length === 7)).toBe(true)
  })

  it('starts on Monday 1 April 2019 and marks today', () => {
    const weeks = buildMonthGrid(2019, 3, 'monday', today)
    const first = weeks[0]!.days[0]!
    expect(first.day).toBe(1)
    expect(first.inMonth).toBe(true)
    expect(weeks[0]!.days[2]!.isToday).toBe(true)
  })

  it('pads with next month and flags its first day', () => {
    const weeks = buildMonthGrid(2019, 3, 'monday', today)
    const lastWeek = weeks[4]!.days
    expect(lastWeek[0]!.day).toBe(29)
    expect(lastWeek[2]!).toMatchObject({
      day: 1,
      inMonth: false,
      isMonthStart: true,
    })
  })

  it('shifts columns for Sunday-start weeks', () => {
    const weeks = buildMonthGrid(2019, 3, 'sunday', today)
    expect(weeks[0]!.days[0]!).toMatchObject({ day: 31, inMonth: false })
    expect(weeks[0]!.days[1]!.day).toBe(1)
  })
})

describe('getWeekdayLabels', () => {
  it('returns two-letter labels in order', () => {
    expect(getWeekdayLabels('monday', 'en-US')).toEqual([
      'Mo',
      'Tu',
      'We',
      'Th',
      'Fr',
      'Sa',
      'Su',
    ])
    expect(getWeekdayLabels('sunday', 'en-US')[0]).toBe('Su')
  })
})
