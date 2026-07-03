import { defineStore } from 'pinia'
import { ref } from 'vue'

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
    const presetId = ref('warm-gradient')
    const singleImageId = ref<string | null>(null)
    const galleryImageIds = ref<string[]>([])
    const galleryIntervalSec = ref(30)
    const videoId = ref<string | null>(null)
    const overlay = ref<BackgroundOverlay>({
      dim: 0.2,
      blur: 0,
      gradient: true,
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
