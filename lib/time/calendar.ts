export type WeekStart = 'monday' | 'sunday'

export interface CalendarDay {
  date: Date
  day: number
  inMonth: boolean
  isToday: boolean
  isWeekend: boolean
  /** First day of the previous/next month — highlighted as a month marker. */
  isMonthStart: boolean
}

export interface CalendarWeek {
  weekNumber: number
  days: CalendarDay[]
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function getIsoWeekNumber(date: Date): number {
  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  )
  const dayNumber = (target.getUTCDay() + 6) % 7
  target.setUTCDate(target.getUTCDate() - dayNumber + 3)
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4))
  const diff = target.getTime() - firstThursday.getTime()
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000))
}

/**
 * A fixed 6×7 month grid (so the widget never jumps in height), padded
 * with the trailing/leading days of the adjacent months.
 */
export function buildMonthGrid(
  year: number,
  month: number,
  weekStart: WeekStart,
  today: Date,
): CalendarWeek[] {
  const first = new Date(year, month, 1)
  const startOffset =
    weekStart === 'monday' ? (first.getDay() + 6) % 7 : first.getDay()

  const weeks: CalendarWeek[] = []
  for (let w = 0; w < 6; w++) {
    const days: CalendarDay[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(year, month, 1 - startOffset + w * 7 + d)
      const weekday = date.getDay()
      const inMonth = date.getMonth() === month
      days.push({
        date,
        day: date.getDate(),
        inMonth,
        isToday: sameDay(date, today),
        isWeekend: weekday === 0 || weekday === 6,
        isMonthStart: !inMonth && date.getDate() === 1,
      })
    }
    // ISO week numbers are defined Monday-based; the Thursday of a
    // Monday-start row (or the Wednesday→Thursday of a Sunday-start row)
    // always lands in the right ISO week.
    weeks.push({
      weekNumber: getIsoWeekNumber(days[weekStart === 'monday' ? 3 : 4]!.date),
      days,
    })
  }
  return weeks
}

/** Two-letter weekday headers in the user's locale, e.g. "Mo Tu We…". */
export function getWeekdayLabels(
  weekStart: WeekStart,
  locale?: string,
): string[] {
  const format = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  // 2024-01-01 was a Monday.
  const base = weekStart === 'monday' ? 1 : 0
  return Array.from({ length: 7 }, (_, i) => {
    const label = format.format(new Date(2024, 0, base + i))
    return label.charAt(0).toUpperCase() + label.slice(1, 2)
  })
}
