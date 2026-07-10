import { expect, test, type Page } from '@playwright/test'

type ColorScheme = 'light' | 'dark'

type ThemeWriteCounts = {
  storage: number
  cookie: number
}

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
  test('follows the light system preference and exposes an accessible toggle', async ({ page }) => {
    await loadWithColorScheme(page, 'light')

    const toggle = page.locator('#theme-toggle')
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to dark mode')
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect(toggle).toHaveCSS('width', '44px')
    const visibleDiameter = await toggle.evaluate(
      (element) => getComputedStyle(element, '::before').width
    )
    expect(visibleDiameter).toBe('40px')
    await expect(page.locator('html')).toHaveCSS(
      'background-color',
      expectedColors.light.background
    )
    await expect(page.locator('html')).toHaveCSS('color', expectedColors.light.text)
  })

  test('follows the dark system preference and updates browser theme metadata', async ({
    page,
  }) => {
    await loadWithColorScheme(page, 'dark')

    await expect(page.locator('#theme-toggle')).toHaveAttribute(
      'aria-label',
      'Switch to light mode'
    )
    await expect(page.locator('#theme-toggle')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('html')).toHaveCSS('background-color', expectedColors.dark.background)
    await expect(page.locator('html')).toHaveCSS('color', expectedColors.dark.text)
    await expect(page.locator('#theme-color-dark')).toHaveAttribute(
      'media',
      '(prefers-color-scheme: dark)'
    )
    await expect(page.locator('#theme-color-light')).toHaveAttribute(
      'media',
      '(prefers-color-scheme: light)'
    )
  })

  test('switches the current document without persisting the preference', async ({ page }) => {
    await page.addInitScript(() => {
      const counts = { storage: 0, cookie: 0 }
      Object.defineProperty(window, '__themeWriteCounts', { value: counts, configurable: true })

      const originalSetItem = Reflect.get(Storage.prototype, 'setItem')
      Storage.prototype.setItem = function (...args) {
        counts.storage += 1
        return Reflect.apply(originalSetItem, this, args)
      }

      const cookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')
      if (cookieDescriptor?.get && cookieDescriptor.set) {
        const cookieGetter = Reflect.get(cookieDescriptor, 'get') as () => string
        const cookieSetter = Reflect.get(cookieDescriptor, 'set') as (value: string) => void
        Object.defineProperty(Document.prototype, 'cookie', {
          configurable: cookieDescriptor.configurable,
          enumerable: cookieDescriptor.enumerable,
          get() {
            return Reflect.apply(cookieGetter, this, [])
          },
          set(value: string) {
            counts.cookie += 1
            Reflect.apply(cookieSetter, this, [value])
          },
        })
      }
    })
    await loadWithColorScheme(page, 'light')

    const toggle = page.locator('#theme-toggle')
    await toggle.focus()
    await expect(toggle).toBeFocused()
    await page.keyboard.press('Enter')

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to light mode')
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('html')).toHaveCSS('background-color', expectedColors.dark.background)
    await expect(page.locator('#theme-color-dark')).toHaveAttribute('media', 'all')
    await expect(page.locator('#theme-color-light')).toHaveAttribute('media', 'not all')

    await toggle.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to dark mode')
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect(page.locator('html')).toHaveCSS(
      'background-color',
      expectedColors.light.background
    )
    await expect(page.locator('#theme-color-light')).toHaveAttribute('media', 'all')
    await expect(page.locator('#theme-color-dark')).toHaveAttribute('media', 'not all')

    const writes = await page.evaluate(() => {
      const counts = (window as Window & { __themeWriteCounts?: ThemeWriteCounts })
        .__themeWriteCounts
      return {
        counts,
        cookie: document.cookie,
        localStorage: window.localStorage.length,
        sessionStorage: window.sessionStorage.length,
      }
    })
    expect(writes.counts).toEqual({ storage: 0, cookie: 0 })
    expect(writes.cookie).toBe('')
    expect(writes.localStorage).toBe(0)
    expect(writes.sessionStorage).toBe(0)
  })

  test('follows system changes until a manual override is active', async ({ page }) => {
    await loadWithColorScheme(page, 'light')

    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await page.locator('#theme-toggle').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    await page.emulateMedia({ colorScheme: 'dark' })
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('resets a manual override to the system preference after reload', async ({ page }) => {
    await loadWithColorScheme(page, 'light')
    await page.locator('#theme-toggle').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('does not introduce horizontal overflow at the mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await loadWithColorScheme(page, 'dark')

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    )
    expect(hasOverflow).toBe(false)
  })
})

for (const colorScheme of ['light', 'dark'] as const) {
  test(`uses the CSS system fallback without JavaScript (${colorScheme})`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    await context.setExtraHTTPHeaders({ 'Cache-Control': 'no-cache' })
    const page = await context.newPage()
    await page.emulateMedia({ colorScheme })
    await page.goto('/')

    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/)
    await expect(page.locator('html')).toHaveCSS(
      'background-color',
      expectedColors[colorScheme].background
    )
    await expect(page.locator('html')).toHaveCSS('color', expectedColors[colorScheme].text)
    await expect(page.locator('#theme-toggle')).toHaveAttribute('hidden', '')

    await context.close()
  })
}
