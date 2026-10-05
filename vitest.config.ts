import { defineConfig } from 'vitest/config'

// Unit tests cover the framework-agnostic code in lib/ — no Nuxt needed.
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
})
