import { defineConfig } from 'vitest/config'

const isCI = Boolean(process.env.CI)
const vitestMaxWorkers = process.env.VITEST_MAX_WORKERS ?? (isCI ? 1 : '75%')

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx,js}'],
    environment: 'node',
    globals: true,
    passWithNoTests: true,
    maxWorkers: vitestMaxWorkers,
  },
})
