import wavesUrl from '~/assets/images/waves_bg.jpg'

export interface BackgroundPreset {
  id: string
  name: string
  style: Record<string, string>
}

export const DEFAULT_PRESET_ID = 'waves'

export const backgroundPresets: BackgroundPreset[] = [
  {
    id: 'waves',
    name: 'Waves',
    style: {
      background: `#0a3a5c url("${wavesUrl}") center / cover no-repeat`,
    },
  },
  {
    id: 'warm-gradient',
    name: 'Sunset',
    style: {
      background:
        'radial-gradient(120% 90% at 100% 100%, #f68d42 0%, rgba(246,141,66,0) 55%), radial-gradient(90% 80% at 0% 0%, #337ba6 0%, rgba(51,123,166,0) 60%), #0a2a44',
    },
  },
  {
    id: 'soft-fade',
    name: 'Aurora',
    style: {
      background:
        'radial-gradient(70% 60% at 20% 15%, rgba(62,214,160,0.45) 0%, rgba(62,214,160,0) 70%), radial-gradient(60% 70% at 85% 80%, rgba(139,124,246,0.5) 0%, rgba(139,124,246,0) 70%), #0b1020',
    },
  },
  {
    id: 'dune',
    name: 'Dune',
    style: {
      background:
        'linear-gradient(160deg, #f9ebe2 0%, #fbc4ab 45%, #f68d42 100%)',
    },
  },
  {
    id: 'mist',
    name: 'Mist',
    style: {
      background:
        'linear-gradient(165deg, #e8eef3 0%, #b9d3e3 50%, #7cb0cc 100%)',
    },
  },
  {
    id: 'dark-minimal',
    name: 'Midnight',
    style: {
      background: 'radial-gradient(80% 60% at 50% 0%, #16243a 0%, #070b13 70%)',
    },
  },
]

export function getBackgroundPreset(id: string): BackgroundPreset {
  return (
    backgroundPresets.find((preset) => preset.id === id) ??
    backgroundPresets[0]!
  )
}
