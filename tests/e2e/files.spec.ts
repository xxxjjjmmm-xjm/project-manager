import { test, expect } from '@playwright/test'

test.describe('Files', () => {
  test('shows the empty state and an upload button (seed has no files)', async ({ page }) => {
    await page.goto('/files')

    await expect(page.getByRole('button', { name: '上传文件' })).toBeVisible()

    // Seed data creates no files, so the empty state is shown.
    await expect(page.getByText('还没有文件，点击上传')).toBeVisible()
  })
})
