import { defineStore } from 'pinia'
import { ref } from 'vue'

export type EditorPanel = 'picker' | 'settings'

/** Session-only UI state — intentionally not persisted. */
export const useEditorStore = defineStore('editor', () => {
  const isEditing = ref(false)
  const fullscreenItemId = ref<string | null>(null)
  const selectedItemId = ref<string | null>(null)
  const activePanel = ref<EditorPanel | null>(null)

  function toggleEditing() {
    isEditing.value = !isEditing.value
    if (!isEditing.value) {
      selectedItemId.value = null
      if (activePanel.value === 'picker') activePanel.value = null
    }
  }

  function togglePanel(panel: EditorPanel) {
    activePanel.value = activePanel.value === panel ? null : panel
    if (activePanel.value) selectedItemId.value = null
  }

  function closePanel() {
    activePanel.value = null
  }

  function selectItem(id: string | null) {
    selectedItemId.value = id
    if (id) activePanel.value = null
  }

  function enterFullscreen(id: string) {
    fullscreenItemId.value = id
    selectedItemId.value = null
    activePanel.value = null
  }

  function exitFullscreen() {
    fullscreenItemId.value = null
  }

  /** Escape closes the innermost open thing first. */
  function handleEscape() {
    if (fullscreenItemId.value) exitFullscreen()
    else if (selectedItemId.value) selectItem(null)
    else if (activePanel.value) closePanel()
    else if (isEditing.value) toggleEditing()
  }

  return {
    isEditing,
    fullscreenItemId,
    selectedItemId,
    activePanel,
    toggleEditing,
    togglePanel,
    closePanel,
    selectItem,
    enterFullscreen,
    exitFullscreen,
    handleEscape,
  }
})
