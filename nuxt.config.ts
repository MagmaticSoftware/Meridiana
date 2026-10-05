import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Everything (layout, preferences, background assets) lives in the
  // browser, and every widget depends on the client clock, so server
  // rendering only produced empty shells and hydration mismatches.
  ssr: false,

  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vite-pwa/nuxt',
  ],

  css: [
    '@fontsource-variable/inter',
    '@fontsource-variable/outfit',
    '@fontsource-variable/oswald',
    '~/assets/css/main.css',
  ],

  piniaPluginPersistedstate: {
    storage: 'localStorage',
  },

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
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover',
        },
        { name: 'theme-color', content: '#0a1626' },
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
      theme_color: '#0a1626',
      background_color: '#0a1626',
      display: 'standalone',
      orientation: 'any',
    },
    pwaAssets: {
      preset: 'minimal-2023',
      image: 'public/logo.svg',
    },
    workbox: {
      navigateFallback: '/',
      // Weather keeps working (with the last reading) when briefly offline.
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/(api|geocoding-api)\.open-meteo\.com\/.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'open-meteo',
            networkTimeoutSeconds: 8,
            expiration: { maxEntries: 40, maxAgeSeconds: 24 * 60 * 60 },
          },
        },
      ],
      globPatterns: ['**/*.{js,css,html,png,jpg,svg,ico,webmanifest,woff2}'],
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
