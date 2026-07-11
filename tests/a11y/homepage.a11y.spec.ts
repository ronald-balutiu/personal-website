import AxeBuilderPlaywright from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 853, height: 1280 },
  { name: 'mobile', width: 390, height: 844 },
]

for (const viewport of viewports) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`homepage has no serious accessibility violations at ${viewport.name} size in ${colorScheme} mode`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })
      const response = await page.goto('/')

      expect(response?.status()).toBe(200)
      await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme)

      const { violations } = await new AxeBuilderPlaywright({ page }).analyze()
      const seriousViolations = violations.filter(
        ({ impact }) => impact === 'serious' || impact === 'critical'
      )

      expect(seriousViolations).toEqual([])
    })
  }
}
