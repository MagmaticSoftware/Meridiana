import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEditorStore = defineStore('editor', () => {
  const isEditing = ref(false)
  const fullscreenItemId = ref<string | null>(null)
  const selectedItemId = ref<string | null>(null)
  const isPickerOpen = ref(false)

  function toggleEditing() {
    isEditing.value = !isEditing.value
    if (!isEditing.value) {
      selectedItemId.value = null
      isPickerOpen.value = false
    }
  }

  function togglePicker() {
    isPickerOpen.value = !isPickerOpen.value
  }

  function selectItem(id: string | null) {
    selectedItemId.value = id
  }

  function enterFullscreen(id: string) {
    fullscreenItemId.value = id
  }

  function exitFullscreen() {
    fullscreenItemId.value = null
  }

  function toggleFullscreen(id: string) {
    fullscreenItemId.value = fullscreenItemId.value === id ? null : id
  }

  return {
    isEditing,
    fullscreenItemId,
    selectedItemId,
    isPickerOpen,
    toggleEditing,
    togglePicker,
    selectItem,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  }
})
