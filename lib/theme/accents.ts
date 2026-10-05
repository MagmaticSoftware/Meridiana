export interface Accent {
  id: string
  name: string
  /** The accent itself (fills, highlights, second hands…). */
  color: string
  /** Readable text/icon color on top of an accent fill. */
  onColor: string
}

export const accents: Accent[] = [
  { id: 'tangerine', name: 'Tangerine', color: '#f68d42', onColor: '#2a1203' },
  { id: 'coral', name: 'Coral', color: '#f2605c', onColor: '#2b0706' },
  { id: 'sunflower', name: 'Sunflower', color: '#f4d23c', onColor: '#2b2402' },
  { id: 'mint', name: 'Mint', color: '#3ed6a0', onColor: '#03251a' },
  { id: 'cyan', name: 'Cyan', color: '#22d3e6', onColor: '#032529' },
  { id: 'ocean', name: 'Ocean', color: '#5aa2d6', onColor: '#04192b' },
  { id: 'iris', name: 'Iris', color: '#8b7cf6', onColor: '#120b33' },
]

export const DEFAULT_ACCENT_ID = 'tangerine'

export function getAccent(id: string): Accent {
  return accents.find((accent) => accent.id === id) ?? accents[0]!
}
