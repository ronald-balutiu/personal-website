import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { expect, test } from '@playwright/test'

const thisFile = fileURLToPath(import.meta.url)
const thisDir = path.dirname(thisFile)
const projectsContentDir = path.resolve(thisDir, '../../src/content/projects')

const projectSlugs = readdirSync(projectsContentDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
  .map((entry) => entry.name.replace(/\.md$/, ''))
  .sort()

test('homepage renders and includes core sections', async ({ page }) => {
  const response = await page.goto('/')
  expect(response, 'Expected the homepage request to return a response').not.toBeNull()
  expect(response?.status(), 'Expected the homepage request to return status 200').toBe(200)

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'About' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Experience' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Projects' })).toBeVisible()
})

test('representative project route renders title, description, and primary link', async ({ page }) => {
  const response = await page.goto('/personal-website')
  expect(response, 'Expected /personal-website to return a response').not.toBeNull()
  expect(response?.status(), 'Expected /personal-website to return status 200').toBe(200)

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
    const response = await page.goto(`/${slug}`)
    expect(response, `Expected slug "${slug}" to return a response`).not.toBeNull()
    expect(response?.status(), `Expected slug "${slug}" to resolve without 404`).toBe(200)

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
}
