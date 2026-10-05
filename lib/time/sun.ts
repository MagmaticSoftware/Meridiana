// Low-precision solar geometry (NOAA "General Solar Position" formulas).
// Accurate to a couple of minutes — plenty for day/night shading and
// sunrise/sunset labels on a clock.

const DEG = Math.PI / 180

function dayOfYearUtc(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1)
  return Math.floor((date.getTime() - start) / 86_400_000) + 1
}

function solarTerms(date: Date) {
  const hourUtc =
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  const gamma =
    ((2 * Math.PI) / 365) * (dayOfYearUtc(date) - 1 + (hourUtc - 12) / 24)

  // Equation of time, in minutes.
  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma))

  // Solar declination, in radians.
  const declination =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma)

  return { hourUtc, eqTime, declination }
}

/** The point on Earth where the sun is directly overhead, in degrees. */
export function getSubsolarPoint(date: Date): { lat: number; lon: number } {
  const { hourUtc, eqTime, declination } = solarTerms(date)
  let lon = -15 * (hourUtc - 12 + eqTime / 60)
  lon = ((((lon + 180) % 360) + 360) % 360) - 180
  return { lat: declination / DEG, lon }
}

/** Sun elevation above the horizon at a location, in degrees. */
export function getSolarElevation(
  date: Date,
  lat: number,
  lon: number,
): number {
  const sun = getSubsolarPoint(date)
  const sinEl =
    Math.sin(lat * DEG) * Math.sin(sun.lat * DEG) +
    Math.cos(lat * DEG) *
      Math.cos(sun.lat * DEG) *
      Math.cos((lon - sun.lon) * DEG)
  return Math.asin(Math.min(1, Math.max(-1, sinEl))) / DEG
}

/** True once the sun's upper limb is below the horizon (incl. refraction). */
export function isNight(date: Date, lat: number, lon: number): boolean {
  return getSolarElevation(date, lat, lon) < -0.833
}

/**
 * Sunrise and sunset for the UTC day containing `date`. Either is null
 * during polar day/night.
 */
export function getSunTimes(
  date: Date,
  lat: number,
  lon: number,
): { sunrise: Date | null; sunset: Date | null } {
  const noon = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12),
  )
  const { eqTime, declination } = solarTerms(noon)
  const cosHa =
    Math.cos(90.833 * DEG) / (Math.cos(lat * DEG) * Math.cos(declination)) -
    Math.tan(lat * DEG) * Math.tan(declination)
  if (cosHa < -1 || cosHa > 1) return { sunrise: null, sunset: null }

  const ha = Math.acos(cosHa) / DEG
  const midnight = noon.getTime() - 12 * 3_600_000
  const toDate = (minutes: number) => new Date(midnight + minutes * 60_000)
  return {
    sunrise: toDate(720 - 4 * (lon + ha) - eqTime),
    sunset: toDate(720 - 4 * (lon - ha) - eqTime),
  }
}

/**
 * Latitude of the day/night terminator at each longitude, plus which pole
 * is currently in darkness — enough to draw the night side as a polygon.
 */
export function getTerminator(
  date: Date,
  stepDeg = 2,
): { points: { lon: number; lat: number }[]; darkPole: 'north' | 'south' } {
  const sun = getSubsolarPoint(date)
  // Avoid tan(0) at the equinoxes, where the terminator is a meridian.
  const decl =
    (Math.abs(sun.lat) < 0.05 ? 0.05 * Math.sign(sun.lat || 1) : sun.lat) * DEG
  const points: { lon: number; lat: number }[] = []
  for (let lon = -180; lon <= 180; lon += stepDeg) {
    const lat =
      Math.atan(-Math.cos((lon - sun.lon) * DEG) / Math.tan(decl)) / DEG
    points.push({ lon, lat })
  }
  return { points, darkPole: decl > 0 ? 'south' : 'north' }
}
