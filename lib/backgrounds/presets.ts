export interface BackgroundPreset {
  id: string
  name: string
  style: Record<string, string>
}

export const backgroundPresets: BackgroundPreset[] = [
  {
    id: 'dark-minimal',
    name: 'Dark Minimal',
    style: { background: 'var(--color-surface-950)' },
  },
  {
    id: 'warm-gradient',
    name: 'Warm Gradient',
    style: {
      background:
        'linear-gradient(160deg, var(--color-surface-950) 0%, var(--color-surface-800) 45%, var(--color-accent-600) 100%)',
    },
  },
  {
    id: 'soft-fade',
    name: 'Soft Fade',
    style: {
      background:
        'radial-gradient(circle at 30% 20%, var(--color-surface-800) 0%, var(--color-surface-950) 70%)',
    },
  },
]

export function getBackgroundPreset(id: string): BackgroundPreset | undefined {
  return backgroundPresets.find((preset) => preset.id === id)
}
