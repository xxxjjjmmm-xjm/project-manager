import { test, expect } from '@playwright/test'

test.describe('Tasks', () => {
  test('shows seeded tasks with status filter and my-tasks toggle', async ({ page }) => {
    await page.goto('/tasks')

    await expect(page.getByText('Design mockups')).toBeVisible()
    await expect(page.getByText('Frontend implementation')).toBeVisible()

    // Status filter section heading.
    await expect(page.getByText('状态', { exact: true })).toBeVisible()

    // "我的任务" toggle (appears in the page title and the toggle row).
    await expect(page.getByText('我的任务', { exact: true }).first()).toBeVisible()
  })
})
