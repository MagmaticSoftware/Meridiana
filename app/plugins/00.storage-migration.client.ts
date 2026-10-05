// v0.1 persisted Pinia state in cookies (the persistedstate default). That
// silently broke past the ~4 KB cookie limit (e.g. a long checklist) and
// sent the whole layout with every request, so state now lives in
// localStorage. Move any old cookie over once, before stores hydrate.
const PERSISTED_STORE_IDS = ['layout', 'background']

export default defineNuxtPlugin({
  name: 'storage-migration',
  enforce: 'pre',
  setup() {
    for (const id of PERSISTED_STORE_IDS) {
      const match = document.cookie.match(new RegExp(`(?:^|; )${id}=([^;]*)`))
      if (!match) continue
      try {
        const json = decodeURIComponent(match[1]!)
        JSON.parse(json)
        if (localStorage.getItem(id) === null) localStorage.setItem(id, json)
      } catch {
        // Unreadable cookie: drop it and start from defaults.
      }
      document.cookie = `${id}=; path=/; max-age=0`
    }
  },
})
