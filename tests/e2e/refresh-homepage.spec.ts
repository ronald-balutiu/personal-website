import { expect, test } from '@playwright/test'

for (const position of ['middle', 'bottom'] as const) {
  test(`a reload at the ${position} restores the position and resting hand`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 600 })
    await page.goto('/')
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(document.getAnimations().map((animation) => animation.finished))
    })
    const hand = page.locator('.intro-peace-icon')
    const restingTransform = await hand.evaluate((element) => getComputedStyle(element).transform)
    const scrollY = await page.evaluate((target) => {
      window.scrollTo(0, target === 'bottom' ? document.documentElement.scrollHeight : 400)
      return window.scrollY
    }, position)
    expect(scrollY).toBeGreaterThan(1)

    await page.reload()
    await expect(page.locator('body')).toHaveCSS('visibility', 'visible')
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(scrollY, 0)
    await expect(hand).toHaveCSS('transform', restingTransform)
    await expect(page.locator('.intro-description')).toHaveCSS('animation-name', 'none')
    await expect(hand).toHaveCSS('animation-name', 'none')
    await expect(page.locator('.theme-toggle')).toHaveCSS('animation-name', 'none')
  })
}

test('a reload at the top retains the entrance animation', async ({ page }) => {
  await page.goto('/')
  await page.reload()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('.intro-peace-icon')).toHaveCSS('animation-name', 'peace-tilt')
})

test('a reload stays readable while an image is still loading', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 })
  await page.goto('/')
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(document.getAnimations().map((animation) => animation.finished))
    window.scrollTo(0, 400)
  })
  let release = () => {}
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/assets/email.svg', async (route) => {
    await gate
    await route.continue()
  })
  try {
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator('body')).toHaveCSS('visibility', 'visible')
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(400, 0)
  } finally {
    release()
  }
  await page.waitForLoadState('load')
})
