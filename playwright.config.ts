import { defineConfig, devices } from '@playwright/test'

const host = '127.0.0.1'
const port = 4173
const baseURL = `http://${host}:${port}`
const isCI = Boolean(process.env.CI)
const playwrightWorkers = process.env.PLAYWRIGHT_WORKERS ?? (isCI ? 1 : '50%')

export default defineConfig({
  testDir: 'tests',

  timeout: 30_000,
  expect: { timeout: 5_000 },

  fullyParallel: false,

  retries: isCI ? 2 : 0,
  workers: playwrightWorkers,
  reporter: isCI ? 'line' : 'list',

  use: {
    baseURL,
    headless: true,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: `npm run build && npm run preview -- --host ${host} --port ${port}`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
})
