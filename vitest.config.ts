import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx,js}'],
    environment: 'node',
    globals: true,
    passWithNoTests: true,
  },
})