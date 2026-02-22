import AxeBuilderPlaywright from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const blockingImpacts = new Set(['serious', 'critical'])

const formatViolations = (
  violations: Array<{ id: string; impact?: string | null; nodes: Array<{ target: unknown }> }>
) => {
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .slice(0, 3)
        .map((node) => (Array.isArray(node.target) ? node.target.map(String).join(' ') : String(node.target)))
        .join(' | ')
      return `${violation.id} [${violation.impact ?? 'unknown'}] targets: ${targets}`
    })
    .join('\n')
}

const routes = [
  { path: '/', label: 'homepage' },
  { path: '/personal-website', label: 'project page' },
]

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

    expect(
      blockingViolations,
      `Blocking accessibility violations found on ${route.path}:\n${formatViolations(blockingViolations)}`
    ).toEqual([])
  })
}
