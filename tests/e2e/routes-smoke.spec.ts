import { expect, type Page, test } from '@playwright/test'

const criticalResourceTypes = new Set(['document', 'script', 'xhr', 'fetch', 'stylesheet', 'font'])

const monitorRuntimeErrors = (page: Page) => {
  const errors: string[] = []

  page.on('pageerror', (error) => errors.push(`page error: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console error: ${message.text()}`)
  })
  page.on('requestfailed', (request) => {
    if (criticalResourceTypes.has(request.resourceType())) {
      errors.push(
        `${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'failed'}`
      )
    }
  })
  page.on('response', (response) => {
    if (criticalResourceTypes.has(response.request().resourceType()) && response.status() >= 400) {
      errors.push(`${response.status()} ${response.request().method()} ${response.url()}`)
    }
  })

  return errors
}

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 853, height: 1280 },
  { name: 'mobile', width: 390, height: 844 },
]

for (const viewport of viewports) {
  test(`homepage renders at ${viewport.name} size without runtime errors`, async ({ page }) => {
    await page.setViewportSize(viewport)
    const runtimeErrors = monitorRuntimeErrors(page)
    const response = await page.goto('/')

    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText("Hello, I'm Ronald Balutiu.")
    await expect(
      page.getByRole('heading', { level: 2, name: 'A couple things I’ve made' })
    ).toBeVisible()
    await expect(
      page.getByRole('navigation', { name: 'Social links' }).getByRole('link')
    ).toHaveCount(4)
    await expect(page.locator('.intro-about-details p')).toHaveCount(3)
    await expect(page.locator('.project-item-link')).toHaveCount(2)
    await page.waitForLoadState('networkidle')
    expect(runtimeErrors).toEqual([])
  })
}
