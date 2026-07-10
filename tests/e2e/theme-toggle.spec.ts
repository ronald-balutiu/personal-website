import { expect, test, type Page } from '@playwright/test'

type ColorScheme = 'light' | 'dark'

const expectedColors: Record<ColorScheme, { background: string; text: string }> = {
  light: { background: 'rgb(248, 242, 238)', text: 'rgb(31, 41, 55)' },
  dark: { background: 'rgb(41, 40, 39)', text: 'rgb(225, 222, 218)' },
}

const loadWithColorScheme = async (page: Page, colorScheme: ColorScheme) => {
  await page.emulateMedia({ colorScheme })
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme)
}

test.describe('theme toggle', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`follows the ${colorScheme} system preference`, async ({ page }) => {
      await loadWithColorScheme(page, colorScheme)

      const oppositeScheme = colorScheme === 'light' ? 'dark' : 'light'
      const toggle = page.getByRole('button', { name: `Switch to ${oppositeScheme} mode` })
      await expect(toggle).toBeVisible()
      await expect(toggle).toHaveAttribute('aria-pressed', String(colorScheme === 'dark'))
      await expect(page.locator('html')).toHaveCSS(
        'background-color',
        expectedColors[colorScheme].background
      )
      await expect(page.locator('html')).toHaveCSS('color', expectedColors[colorScheme].text)
    })
  }

  test('switches the current page and resets to the system preference on reload', async ({
    page,
  }) => {
    await loadWithColorScheme(page, 'light')

    const toggle = page.locator('#theme-toggle')
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to dark mode')
    await toggle.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to light mode')
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('#theme-color-dark')).toHaveAttribute('media', 'all')
    await expect(page.locator('#theme-color-light')).toHaveAttribute('media', 'not all')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('follows system changes until manually overridden', async ({ page }) => {
    await loadWithColorScheme(page, 'light')

    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await page.getByRole('button', { name: 'Switch to light mode' }).click()
    await page.emulateMedia({ colorScheme: 'light' })
    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('does not introduce horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await loadWithColorScheme(page, 'dark')

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  })
})

for (const colorScheme of ['light', 'dark'] as const) {
  test(`uses the CSS ${colorScheme} fallback without JavaScript`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, colorScheme })
    const page = await context.newPage()
    await page.goto('/')

    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/)
    await expect(page.locator('html')).toHaveCSS(
      'background-color',
      expectedColors[colorScheme].background
    )
    await expect(page.locator('#theme-toggle')).toBeHidden()

    await context.close()
  })
}
