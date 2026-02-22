import { expect, type Page, test } from '@playwright/test'

test.use({ viewport: { width: 1440, height: 900 } })

const getActiveHash = async (page: Page) => {
  return page.evaluate(() => {
    const activeLink = document.querySelector<HTMLAnchorElement>('.jump-link-active')
    return activeLink?.getAttribute('href') ?? ''
  })
}

const expectActiveHash = async (page: Page, hash: string) => {
  await expect.poll(() => getActiveHash(page)).toBe(hash)
}

const scrollHeadingToActivationLine = async (page: Page, sectionId: string) => {
  await page.evaluate((targetSectionId) => {
    const section = document.getElementById(targetSectionId)
    if (!section) {
      throw new Error(`Missing section: ${targetSectionId}`)
    }

    const labelId = section.getAttribute('aria-labelledby')
    const heading = (labelId ? document.getElementById(labelId) : null) ?? section
    const headingTop = window.scrollY + heading.getBoundingClientRect().top
    const activationLine = window.innerHeight * 0.65
    const targetScrollY = Math.max(0, Math.floor(headingTop - activationLine + 1))

    window.scrollTo({ top: targetScrollY, behavior: 'auto' })
  }, sectionId)
}

const scrollPastActivationLine = async (page: Page, sectionId: string) => {
  await page.evaluate((targetSectionId) => {
    const section = document.getElementById(targetSectionId)
    if (!section) {
      throw new Error(`Missing section: ${targetSectionId}`)
    }

    const labelId = section.getAttribute('aria-labelledby')
    const heading = (labelId ? document.getElementById(labelId) : null) ?? section
    const headingTop = window.scrollY + heading.getBoundingClientRect().top
    const activationLine = window.innerHeight * 0.65
    const targetScrollY = Math.max(0, Math.floor(headingTop - activationLine - 24))

    window.scrollTo({ top: targetScrollY, behavior: 'auto' })
  }, sectionId)
}

const waitForJumpLinksVisible = async (page: Page) => {
  await expect(page.locator('.jump-links')).toBeVisible({ timeout: 7000 })
}

test('jump-link clicks update hash, viewport target, and active state', async ({ page }) => {
  await page.goto('/')
  await waitForJumpLinksVisible(page)

  for (const id of ['about', 'experience', 'projects']) {
    await page.locator(`.jump-link[href="#${id}"]`).click()

    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe(`#${id}`)
    await expectActiveHash(page, `#${id}`)

    await expect
      .poll(() =>
        page.evaluate((sectionId) => {
          const section = document.getElementById(sectionId)
          if (!section) return false
          const rect = section.getBoundingClientRect()
          return rect.top < window.innerHeight && rect.bottom > 0
        }, id)
      )
      .toBe(true)
  }
})

test('active state follows deterministic scroll progression and clears near top boundary', async ({
  page,
}) => {
  await page.goto('/')

  await page.evaluate(() => {
    history.replaceState(null, '', window.location.pathname)
    window.scrollTo({ top: 0, behavior: 'auto' })
  })

  await scrollPastActivationLine(page, 'about')
  await expectActiveHash(page, '')

  await scrollHeadingToActivationLine(page, 'about')
  await expectActiveHash(page, '#about')

  await scrollHeadingToActivationLine(page, 'experience')
  await expectActiveHash(page, '#experience')

  await scrollHeadingToActivationLine(page, 'projects')
  await expectActiveHash(page, '#projects')

  await scrollPastActivationLine(page, 'about')
  await expectActiveHash(page, '')
})

test('deep-link load, refresh, and back-forward preserve active link behavior', async ({
  page,
}) => {
  await page.goto('/#experience')
  await waitForJumpLinksVisible(page)
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('#experience')
  await expectActiveHash(page, '#experience')

  await page.reload()
  await waitForJumpLinksVisible(page)
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('#experience')
  await expectActiveHash(page, '#experience')

  await page.locator('.jump-link[href="#projects"]').click()
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('#projects')
  await expectActiveHash(page, '#projects')

  await page.goBack()
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('#experience')
  await scrollHeadingToActivationLine(page, 'experience')
  await expectActiveHash(page, '#experience')
})
