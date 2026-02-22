import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import AxeBuilderPlaywright from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const blockingImpacts = new Set(['serious', 'critical'])

const thisFile = fileURLToPath(import.meta.url)
const thisDir = path.dirname(thisFile)
const projectsContentDir = path.resolve(thisDir, '../../src/content/projects')

const projectSlugs = readdirSync(projectsContentDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
  .map((entry) => entry.name.replace(/\.md$/, ''))
  .sort()

const routes = [
  { path: '/', label: 'homepage' },
  ...projectSlugs.map((slug) => ({ path: `/${slug}`, label: `project route "${slug}"` })),
]

const viewports = [
  { name: 'desktop', size: { width: 1440, height: 900 } },
  { name: 'mobile-iphone', size: { width: 390, height: 844 } },
]

type ViolationLike = { id: string; impact?: string | null; nodes: Array<{ target: unknown }> }

const toTargetString = (target: unknown) => {
  return Array.isArray(target) ? target.map(String).join(' ') : String(target)
}

const formatViolations = (violations: ViolationLike[]) => {
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .slice(0, 3)
        .map((node) => toTargetString(node.target))
        .join(' | ')
      return `${violation.id} [${violation.impact ?? 'unknown'}] targets: ${targets}`
    })
    .join('\n')
}

const incompleteAllowlist = new Set([
  '/|aria-prohibited-attr|.intro-social-links',
  '/|color-contrast|.intro-title-outline',
  '/|color-contrast|.project-item-heading',
  '/|color-contrast|.project-item-description',
])

const collectBlockingIncomplete = (routePath: string, incomplete: ViolationLike[]) => {
  const unresolved: ViolationLike[] = []

  for (const violation of incomplete) {
    if (!violation.impact || !blockingImpacts.has(violation.impact)) continue

    const unresolvedNodes = violation.nodes.filter((node) => {
      const key = `${routePath}|${violation.id}|${toTargetString(node.target)}`
      return !incompleteAllowlist.has(key)
    })

    if (unresolvedNodes.length > 0) {
      unresolved.push({
        id: violation.id,
        impact: violation.impact,
        nodes: unresolvedNodes,
      })
    }
  }

  return unresolved
}

for (const viewport of viewports) {
  test.describe(`a11y (${viewport.name})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(viewport.size)
    })

    for (const route of routes) {
      test(`a11y: ${route.label} blocks serious/critical violations`, async ({ page }) => {
        const response = await page.goto(route.path)
        expect(response, `Expected ${route.path} to return a response`).not.toBeNull()
        expect(response?.status(), `Expected ${route.path} to return status 200`).toBe(200)
        await expect(page.locator('main')).toBeVisible()

        const results = await new AxeBuilderPlaywright({ page }).analyze()
        const blockingViolations = results.violations.filter(
          (violation) => violation.impact && blockingImpacts.has(violation.impact)
        )
        const blockingIncomplete = collectBlockingIncomplete(route.path, results.incomplete)

        expect(
          blockingViolations,
          `Blocking accessibility violations found on ${route.path}:\n${formatViolations(blockingViolations)}`
        ).toEqual([])

        expect(
          blockingIncomplete,
          `Blocking incomplete accessibility findings found on ${route.path} (not allowlisted):\n${formatViolations(
            blockingIncomplete
          )}`
        ).toEqual([])
      })
    }
  })
}
