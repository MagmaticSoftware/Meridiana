import type { City } from '~~/lib/time/cities'
import {
  formatOffset,
  getDayDelta,
  getTimeParts,
  getTimeZoneOffset,
} from '~~/lib/time/format'
import type { TimeParts } from '~~/lib/time/format'
import { isNight } from '~~/lib/time/sun'

export type WorldClockStyle = 'list' | 'tiles' | 'analog' | 'map'

export interface CityTime {
  city: City
  parts: TimeParts
  /** "Today" / "Tomorrow" / "Yesterday", localized. */
  dayLabel: string
  /** Offset from the local time zone, e.g. "+1h". */
  offsetLabel: string
  /** Short date in the city, e.g. "Jun 3". */
  dateLabel: string
  night: boolean
}

const relativeDay = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

export function describeCityTime(
  city: City,
  now: Date,
  hour12: boolean,
): CityTime {
  const offset = getTimeZoneOffset(now, city.timeZone) - getTimeZoneOffset(now)
  const dayLabel = relativeDay.format(getDayDelta(now, city.timeZone), 'day')
  return {
    city,
    parts: getTimeParts(now, { hour12, timeZone: city.timeZone }),
    dayLabel: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1),
    offsetLabel: formatOffset(offset),
    dateLabel: now.toLocaleDateString(undefined, {
      timeZone: city.timeZone,
      month: 'short',
      day: 'numeric',
    }),
    night: isNight(now, city.lat, city.lon),
  }
}

/**
 * Picks a column count so `count` tiles in a `w`×`h` grid area come out
 * closest to `targetAspect` (width / height). Grid cells are roughly
 * 1.25× wider than tall on a landscape screen.
 */
export function bestColumns(
  count: number,
  size: { w: number; h: number },
  targetAspect: number,
): number {
  let best = 1
  let bestScore = Infinity
  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols)
    const aspect = (size.w * 1.25) / cols / (size.h / rows)
    const score =
      Math.abs(Math.log(aspect / targetAspect)) + (cols * rows - count) * 0.15
    if (score < bestScore) {
      best = cols
      bestScore = score
    }
  }
  return best
}
