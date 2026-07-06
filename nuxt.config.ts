import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vite-pwa/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  components: [
    { path: '~/components', pathPrefix: false, extensions: ['vue'] },
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      title: 'Meridiana',
      meta: [
        {
          name: 'description',
          content:
            'A calm, customizable screensaver for desktop, mobile and tablet.',
        },
      ],
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Meridiana',
      short_name: 'Meridiana',
      description:
        'A calm, customizable screensaver for desktop, mobile and tablet.',
      theme_color: '#100d0a',
      background_color: '#100d0a',
      display: 'standalone',
      orientation: 'any',
    },
    pwaAssets: {
      preset: 'minimal-2023',
      image: 'public/logo.svg',
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],
    },
    devOptions: {
      // Keep the SW out of the way during development — it caches the
      // page shell and causes stale content / hydration mismatches while
      // iterating. Re-enable to test installability/offline behavior.
      enabled: false,
      type: 'module',
    },
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },
})
