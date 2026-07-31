import { test, expect } from '@playwright/test'

test.describe('Team', () => {
  test('shows Demo User with the owner role and an invite button', async ({ page }) => {
    await page.goto('/team')

    await expect(page.getByText('Demo User')).toBeVisible()
    await expect(page.getByText('负责人')).toBeVisible()

    await expect(page.getByRole('button', { name: '邀请成员' })).toBeVisible()
  })
})
