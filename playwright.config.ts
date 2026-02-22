import { defineConfig, devices } from '@playwright/test'

const host = '127.0.0.1'
const port = 4173
const baseURL = `http://${host}:${port}`

export default defineConfig({
  testDir: 'tests',

  timeout: 30_000,
  expect: { timeout: 5_000 },

  fullyParallel: false,

  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'line' : 'list',

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
  ],

  webServer: {
    command: `npm run build && npm run preview -- --host ${host} --port ${port}`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
})
