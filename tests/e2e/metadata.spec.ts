import { expect, test } from '@playwright/test'

import { PROJECT_DETAIL_PAGES_ENABLED } from '../../src/config/features'

test.describe('metadata tags', () => {
  test('homepage exposes core metadata and json-ld', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' })

    expect(response, 'Expected homepage to return a response').not.toBeNull()
    expect(response?.status(), 'Expected homepage to resolve without 4xx/5xx').toBe(200)

    await expect(page).toHaveTitle(/Ronald Balutiu/i)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\//)
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website')
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /^https?:\/\//
    )
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image'
    )

    const jsonLdScripts = page.locator('script[type="application/ld+json"]')
    await expect(jsonLdScripts).toHaveCount(2)
  })

  test('project route exposes article metadata and json-ld', async ({ page }) => {
    test.skip(!PROJECT_DETAIL_PAGES_ENABLED, 'Project detail pages are disabled')

    const response = await page.goto('/personal-website', { waitUntil: 'domcontentloaded' })

    expect(response, 'Expected project route to return a response').not.toBeNull()
    expect(response?.status(), 'Expected project route to resolve without 4xx/5xx').toBe(200)

    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/personal-website$/
    )
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1)
  })
})
