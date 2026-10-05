export interface TimeParts {
  hours: string
  minutes: string
  seconds: string
  /** Localized AM/PM marker, or '' in 24-hour mode. */
  period: string
}

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function formatter(
  key: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  let cached = formatterCache.get(key)
  if (!cached) {
    cached = new Intl.DateTimeFormat('en-US', options)
    formatterCache.set(key, cached)
  }
  return cached
}

function pad(value: number): string {
  return value.toString().padStart(2, '0')
}

/**
 * Splits a date into zero-padded clock digits, optionally in another time
 * zone. Digits are always latin so fixed-width layouts (flip cards,
 * tabular numerals) stay predictable regardless of the browser locale.
 */
export function getTimeParts(
  date: Date,
  options: { hour12?: boolean; timeZone?: string } = {},
): TimeParts {
  const { hour12 = false, timeZone } = options
  const parts = formatter(`parts|${timeZone ?? ''}`, {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)

  let hours = get('hour')
  let period = ''
  if (hour12) {
    period = hours < 12 ? 'AM' : 'PM'
    hours = hours % 12 || 12
  }

  return {
    hours: hour12 ? String(hours) : pad(hours),
    minutes: pad(get('minute')),
    seconds: pad(get('second')),
    period,
  }
}

/** Offset of `timeZone` from UTC at `date`, in minutes (e.g. +60 for CET). */
export function getTimeZoneOffset(date: Date, timeZone?: string): number {
  if (!timeZone) return -date.getTimezoneOffset()
  const name =
    formatter(`offset|${timeZone}`, { timeZone, timeZoneName: 'longOffset' })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value ?? 'GMT'
  const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(name)
  if (!match) return 0
  const sign = match[1] === '-' ? -1 : 1
  return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0))
}

/** "+1h", "−5h", "+5:30h", "±0h" — relative to the local time zone. */
export function formatOffset(minutes: number): string {
  if (minutes === 0) return '±0h'
  const sign = minutes > 0 ? '+' : '−'
  const abs = Math.abs(minutes)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return `${sign}${h}${m ? `:${pad(m)}` : ''}h`
}

/** Calendar date (y, m, d) of `date` as seen in `timeZone`. */
export function getZonedDate(date: Date, timeZone?: string) {
  const parts = formatter(`date|${timeZone ?? ''}`, {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)
  return { year: get('year'), month: get('month'), day: get('day') }
}

/**
 * -1, 0 or +1: whether it's yesterday, today or tomorrow in `timeZone`
 * compared to the local calendar day.
 */
export function getDayDelta(date: Date, timeZone: string): number {
  const local = getZonedDate(date)
  const remote = getZonedDate(date, timeZone)
  const toDays = (d: { year: number; month: number; day: number }) =>
    Date.UTC(d.year, d.month - 1, d.day) / 86_400_000
  return Math.sign(toDays(remote) - toDays(local))
}
