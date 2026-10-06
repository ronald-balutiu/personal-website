import { expect, type Locator, type Page, test } from '@playwright/test'

type Box = { x: number; y: number; width: number; height: number }

const responsiveWidths = Array.from({ length: 121 }, (_, index) => 1280 - index * 8)

const getBox = async (locator: Locator): Promise<Box> => {
  const bounds = await locator.boundingBox()
  expect(bounds).not.toBeNull()
  return bounds as Box
}

const expectNoHorizontalOverflow = async (page: Page) => {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  )
}

test.describe('responsive homepage structure', () => {
  test('desktop uses a two-column hero with socials below all copy', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 853 })
    await page.goto('/')

    const primary = await getBox(page.locator('.intro-primary'))
    const portrait = await getBox(page.locator('.intro-portrait'))
    const socials = await getBox(page.locator('.intro-social-links'))
    const details = await getBox(page.locator('.intro-about-details'))
    expect(portrait.x).toBeGreaterThan(primary.x + primary.width)
    expect(socials.y).toBeGreaterThan(details.y + details.height)
    expect(details.x).toBeLessThan(portrait.x)
    await expect(page.locator('.projects-section')).toHaveCount(0)
    await expect(page.getByText('GitHub ↗')).toHaveCount(0)
    await expectNoHorizontalOverflow(page)
  })

  test('stacks the hero before the greeting needs a second line', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 900 })
    await page.goto('/')

    const primary = await getBox(page.locator('.intro-primary'))
    const portrait = await getBox(page.locator('.intro-portrait'))
    expect(
      Math.abs(portrait.x + portrait.width / 2 - (primary.x + primary.width / 2))
    ).toBeLessThan(1)
    expect(portrait.y).toBeGreaterThan(primary.y + primary.height)
    await expectNoHorizontalOverflow(page)
  })

  for (const viewport of [
    { name: 'tablet', width: 853, height: 1280, socialRows: 1, portraitRatio: 1 },
    { name: 'phone', width: 390, height: 844, socialRows: 2, portraitRatio: 4 / 3 },
  ]) {
    test(`${viewport.name} stacks portrait and About details`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/')

      const primary = await getBox(page.locator('.intro-primary'))
      const portrait = await getBox(page.locator('.intro-portrait'))
      const details = await getBox(page.locator('.intro-about-details'))
      const socials = await getBox(page.locator('.intro-social-links'))
      expect(portrait.y).toBeGreaterThan(primary.y + primary.height)
      expect(portrait.width / portrait.height).toBeCloseTo(viewport.portraitRatio, 2)
      expect(portrait.width).toBeLessThanOrEqual(viewport.width)
      expect(details.y).toBeGreaterThan(portrait.y + portrait.height)
      expect(socials.y).toBeGreaterThan(details.y + details.height)
      await expect(page.locator('.projects-section')).toHaveCount(0)
      const image = await getBox(page.locator('.intro-portrait img'))
      const frame = await page.locator('.intro-portrait').evaluate((element) => ({
        width: element.clientWidth,
        height: element.clientHeight,
      }))
      expect(image.x).toBeGreaterThanOrEqual(portrait.x)
      expect(image.y).toBeGreaterThanOrEqual(portrait.y)
      expect(image.x + image.width).toBeLessThanOrEqual(portrait.x + portrait.width + 1)
      expect(image.y + image.height).toBeLessThanOrEqual(portrait.y + portrait.height + 1)
      expect(Math.abs(image.width - frame.width)).toBeLessThanOrEqual(1)
      expect(Math.abs(image.height - frame.height)).toBeLessThanOrEqual(1)

      const links = page.locator('.intro-social-link')
      const linkBoxes = await Promise.all(
        Array.from({ length: await links.count() }, (_, index) => getBox(links.nth(index)))
      )
      expect(new Set(linkBoxes.map((bounds) => Math.round(bounds.y / 10))).size).toBe(
        viewport.socialRows
      )
      await expectNoHorizontalOverflow(page)
    })
  }

  test('keeps display typography stable as the viewport narrows', async ({ page }) => {
    await page.setViewportSize({ width: responsiveWidths[0], height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)

    const title = page.locator('.intro-title')
    const samples: { fontSize: string; height: number }[] = []

    for (const width of responsiveWidths) {
      await page.setViewportSize({ width, height: 900 })
      samples.push(
        await title.evaluate((element) => ({
          fontSize: getComputedStyle(element).fontSize,
          height: Math.round(element.getBoundingClientRect().height),
        }))
      )
      await expectNoHorizontalOverflow(page)
    }

    expect(new Set(samples.map(({ fontSize }) => fontSize)).size).toBe(1)

    for (let index = 1; index < samples.length; index += 1) {
      expect(samples[index].height).toBeGreaterThanOrEqual(samples[index - 1].height)
    }
  })
})

test('entrance motion stages the title before the remaining content', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.intro-title')).toHaveCSS('opacity', '1')
  await expect(page.locator('.intro-peace-icon')).toHaveCSS('animation-name', 'peace-tilt')
  await expect(page.locator('.intro-description')).toHaveCSS('animation-name', 'content-enter')
  await expect(page.locator('.theme-toggle')).toHaveCSS('animation-name', 'content-enter')
})

for (const operation of ['getItem', 'removeItem', 'setItem'] as const) {
  test(`entrance motion tolerates storage ${operation} failures`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.addInitScript((method) => {
      Storage.prototype[method] = () => {
        throw new DOMException('Storage unavailable', 'QuotaExceededError')
      }
    }, operation)
    await page.goto('/')
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')))
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(errors).toEqual([])
  })
}

test('remembers scroll position on pagehide without writing during scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 })
  await page.addInitScript(() => {
    const originalSetItem = sessionStorage.setItem.bind(sessionStorage)
    Storage.prototype.setItem = function (key, value) {
      if (key === 'home-refresh-scroll-y') {
        const root = document.documentElement
        root.dataset.scrollWrites = String(Number(root.dataset.scrollWrites ?? 0) + 1)
      }
      originalSetItem(key, value)
    }
  })
  await page.goto('/')
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto'
    window.scrollTo(0, document.body.scrollHeight)
  })
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1)
  await page.evaluate(() => window.dispatchEvent(new Event('scroll')))
  await expect(page.locator('html')).not.toHaveAttribute('data-scroll-writes', /.+/)
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')))
  await expect(page.locator('html')).toHaveAttribute('data-scroll-writes', '1')
  const storedPosition = await page.evaluate(() =>
    Number(sessionStorage.getItem('home-refresh-scroll-y'))
  )
  expect(storedPosition).toBeGreaterThan(1)
})

test('entrance motion respects reduced-motion preferences', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('.intro-peace-icon')).toHaveCSS('animation-name', 'none')
  await expect(page.locator('.intro-peace-icon')).not.toHaveCSS('transform', 'none')
  await expect(page.locator('.intro-description')).toHaveCSS('animation-name', 'none')
  await expect(page.locator('.theme-toggle')).toHaveCSS('animation-name', 'none')
})
