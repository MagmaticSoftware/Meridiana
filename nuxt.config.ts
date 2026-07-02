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
      theme_color: '#1a1a1a',
      background_color: '#1a1a1a',
      display: 'standalone',
      orientation: 'any',
      icons: [],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },
})
