import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3456'

test.describe('Project Manager E2E', () => {
  test('dashboard loads', async ({ page }) => {
    await page.goto(BASE)
    const title = await page.title()
    expect(title).toContain('Project Manager')
  })

  test('projects page renders with i18n', async ({ page }) => {
    await page.goto(BASE + '/projects')
    await expect(page.locator('h2')).toContainText(/项目列表|Projects/)
  })

  test('settings page loads with scan controls', async ({ page }) => {
    await page.goto(BASE + '/settings')
    await expect(page.locator('h2')).toContainText(/设置|Settings/)
  })

  test('sidebar navigation works', async ({ page }) => {
    await page.goto(BASE)
    // Click nav links by href
    await page.click('a[href="/projects"]')
    await expect(page).toHaveURL(BASE + '/projects')
    await page.click('a[href="/settings"]')
    await expect(page).toHaveURL(BASE + '/settings')
    await page.click('a[href="/"]')
    await expect(page).toHaveURL(BASE + '/')
  })

  test('stats API returns valid data', async ({ request }) => {
    const res = await request.get(BASE + '/api/stats')
    expect(res.ok()).toBe(true)
    const json = await res.json()
    expect(json.success).toBe(true)
  })
})
