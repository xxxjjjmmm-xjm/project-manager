import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3004'

test.describe('Project Manager E2E', () => {
  test('dashboard loads with stats', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('h2')).toContainText('Dashboard')
  })

  test('projects page renders', async ({ page }) => {
    await page.goto(BASE + '/projects')
    await expect(page.locator('h2')).toContainText('Projects')
  })

  test('settings page loads with scan controls', async ({ page }) => {
    await page.goto(BASE + '/settings')
    await expect(page.locator('h2')).toContainText('Settings')
  })

  test('sidebar navigation works', async ({ page }) => {
    await page.goto(BASE)
    await page.click('text=Projects')
    await expect(page).toHaveURL(BASE + '/projects')
    await page.click('text=Settings')
    await expect(page).toHaveURL(BASE + '/settings')
    await page.click('text=Dashboard')
    await expect(page).toHaveURL(BASE + '/')
  })

  test('stats API returns valid data', async ({ request }) => {
    const res = await request.get(BASE + '/api/stats')
    expect(res.ok()).toBe(true)
    const json = await res.json()
    expect(json.success).toBe(true)
  })
})
