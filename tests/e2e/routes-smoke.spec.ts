import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { expect, type Page, test } from '@playwright/test'

const thisFile = fileURLToPath(import.meta.url)
const thisDir = path.dirname(thisFile)
const projectsContentDir = path.resolve(thisDir, '../../src/content/projects')
const criticalResourceTypes = new Set(['document', 'script', 'xhr', 'fetch', 'stylesheet', 'font'])

const projectSlugs = readdirSync(projectsContentDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
  .map((entry) => entry.name.replace(/\.md$/, ''))
  .sort()

type RuntimeIssue = {
  kind: 'pageerror' | 'console.error' | 'requestfailed' | 'badresponse'
  detail: string
}

const formatIssues = (issues: RuntimeIssue[]) => {
  return issues.map((issue) => `- [${issue.kind}] ${issue.detail}`).join('\n')
}

const createRuntimeHealthMonitor = (page: Page) => {
  const issues: RuntimeIssue[] = []

  page.on('pageerror', (error) => {
    issues.push({ kind: 'pageerror', detail: error.message })
  })

  page.on('console', (message) => {
    if (message.type() === 'error') {
      issues.push({ kind: 'console.error', detail: message.text() })
    }
  })

  page.on('requestfailed', (request) => {
    if (criticalResourceTypes.has(request.resourceType())) {
      issues.push({
        kind: 'requestfailed',
        detail: `${request.method()} ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`,
      })
    }
  })

  page.on('response', (response) => {
    const resourceType = response.request().resourceType()
    if (criticalResourceTypes.has(resourceType) && response.status() >= 400) {
      issues.push({
        kind: 'badresponse',
        detail: `${response.status()} ${response.request().method()} ${response.url()}`,
      })
    }
  })

  return {
    async assertClean(route: string) {
      await page.waitForLoadState('networkidle')
      expect(issues, `Runtime issues detected for "${route}":\n${formatIssues(issues)}`).toEqual([])
    },
  }
}

const openHealthyRoute = async (page: Page, route: string) => {
  const runtimeHealth = createRuntimeHealthMonitor(page)
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' })

  expect(response, `Expected "${route}" to return a response`).not.toBeNull()
  expect(response?.status(), `Expected "${route}" to resolve without 4xx/5xx`).toBe(200)
  await expect(page.locator('main')).toBeVisible()
  await expect(page).toHaveTitle(/.+/)
  await runtimeHealth.assertClean(route)
}

const smokeViewports = [
  { name: 'desktop', size: { width: 1440, height: 900 } },
  { name: 'mobile-iphone', size: { width: 390, height: 844 } },
]

for (const viewport of smokeViewports) {
  test.describe(`routes smoke (${viewport.name})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewport.size)
    })

    test('homepage renders and includes core sections', async ({ page }) => {
      await openHealthyRoute(page, '/')

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.getByRole('heading', { level: 2, name: 'About' })).toBeVisible()
      await expect(page.getByRole('heading', { level: 2, name: 'Experience' })).toBeVisible()
      await expect(page.getByRole('heading', { level: 2, name: 'Projects' })).toBeVisible()
    })

    test('representative project route renders title, description, and primary link', async ({
      page,
    }) => {
      await openHealthyRoute(page, '/personal-website')

      await expect(page.getByRole('heading', { level: 1, name: 'Personal Website' })).toBeVisible()
      await expect(
        page.getByText(
          'An Astro.js side project to build an accessible, lightning fast website in an unfamiliar tech stack.'
        )
      ).toBeVisible()

      const primaryLink = page.getByRole('link', { name: 'View Project' })
      await expect(primaryLink).toBeVisible()
      await expect(primaryLink).toHaveAttribute('href', /^https?:\/\//)
    })

    for (const slug of projectSlugs) {
      test(`project route resolves for content slug "${slug}"`, async ({ page }) => {
        await openHealthyRoute(page, `/${slug}`)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      })
    }
  })
}
