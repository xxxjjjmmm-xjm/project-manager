import { test, expect } from '@playwright/test'

test.describe('Projects', () => {
  test('lists the three seeded projects', async ({ page }) => {
    await page.goto('/projects')

    await expect(page.getByText('Website Redesign')).toBeVisible()
    await expect(page.getByText('Mobile App')).toBeVisible()
    await expect(page.getByText('Internal Tools')).toBeVisible()

    await expect(page.getByRole('button', { name: '新建项目' })).toBeVisible()
  })

  test('clicking a project opens its detail panel', async ({ page }) => {
    await page.goto('/projects')

    await page.getByText('Website Redesign').first().click()

    await expect(page.getByRole('button', { name: '打开详情' })).toBeVisible()
    await expect(page.locator('h2', { hasText: 'Website Redesign' })).toBeVisible()
  })
})
