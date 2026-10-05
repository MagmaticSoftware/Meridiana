import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DEFAULT_ACCENT_ID } from '~~/lib/theme/accents'

export type Tone = 'dark' | 'light'
export type Material = 'glass' | 'solid'

/** Global look shared by every widget card and panel, for a uniform UI. */
export const useAppearanceStore = defineStore(
  'appearance',
  () => {
    const tone = ref<Tone>('dark')
    const material = ref<Material>('glass')
    const accentId = ref(DEFAULT_ACCENT_ID)
    /** Fade controls and cursor out after a few idle seconds. */
    const autoHideControls = ref(true)

    return { tone, material, accentId, autoHideControls }
  },
  { persist: true },
)
