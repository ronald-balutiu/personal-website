import { expect, type Locator, type Page, test } from '@playwright/test'

type Box = { x: number; y: number; width: number; height: number }

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
  test('desktop uses a two-column hero and final project-link column', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 853 })
    await page.goto('/')

    const primary = await getBox(page.locator('.intro-primary'))
    const portrait = await getBox(page.locator('.intro-portrait'))
    const socials = await getBox(page.locator('.intro-social-links'))
    const details = await getBox(page.locator('.intro-about-details'))
    expect(portrait.x).toBeGreaterThan(primary.x + primary.width)
    expect(details.y).toBeGreaterThan(socials.y + socials.height)
    expect(details.x).toBeLessThan(portrait.x)

    const description = await getBox(page.locator('.project-item-description').first())
    const link = await getBox(page.locator('.project-item-link').first())
    expect(link.x).toBeGreaterThan(description.x)
    await expectNoHorizontalOverflow(page)
  })

  for (const viewport of [
    { name: 'tablet', width: 853, height: 1280, socialRows: 1 },
    { name: 'phone', width: 390, height: 844, socialRows: 2 },
  ]) {
    test(`${viewport.name} stacks portrait and About details`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/')

      const primary = await getBox(page.locator('.intro-primary'))
      const portrait = await getBox(page.locator('.intro-portrait'))
      const details = await getBox(page.locator('.intro-about-details'))
      const projects = await getBox(page.locator('.projects-section'))
      expect(portrait.y).toBeGreaterThan(primary.y + primary.height)
      expect(portrait.width).toBeGreaterThan(portrait.height)
      expect(details.y).toBeGreaterThan(portrait.y + portrait.height)
      expect(projects.y).toBeGreaterThanOrEqual(details.y + details.height - 1)

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

  test('phone project links follow their descriptions', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const description = await getBox(page.locator('.project-item-description').first())
    const link = await getBox(page.locator('.project-item-link').first())
    expect(link.y).toBeGreaterThan(description.y + description.height)
  })
})

test('entrance motion respects reduced-motion preferences', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('.home-page')).toHaveCSS('animation-name', 'none')
  await expect(page.locator('.intro-peace-icon')).toHaveCSS('animation-name', 'none')
})
