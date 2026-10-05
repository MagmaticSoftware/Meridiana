import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DEFAULT_PRESET_ID } from '~~/lib/backgrounds/presets'

export type BackgroundMode = 'preset' | 'single' | 'gallery' | 'video'

export interface BackgroundOverlay {
  dim: number
  blur: number
  gradient: boolean
}

export const useBackgroundStore = defineStore(
  'background',
  () => {
    const mode = ref<BackgroundMode>('preset')
    const presetId = ref(DEFAULT_PRESET_ID)
    const singleImageId = ref<string | null>(null)
    const galleryImageIds = ref<string[]>([])
    const galleryIntervalSec = ref(30)
    const videoId = ref<string | null>(null)
    const overlay = ref<BackgroundOverlay>({
      dim: 0.1,
      blur: 0,
      gradient: false,
    })

    return {
      mode,
      presetId,
      singleImageId,
      galleryImageIds,
      galleryIntervalSec,
      videoId,
      overlay,
    }
  },
  { persist: true },
)
