import { test, expect } from '@playwright/test'

test.describe('Settings', () => {
  test('shows all six tabs', async ({ page }) => {
    await page.goto('/settings')

    for (const tab of ['账户', '工作区', '成员', '外观', '集成', '数据']) {
      await expect(page.getByRole('button', { name: tab })).toBeVisible()
    }
  })

  test('integrations tab shows the import plugin and scan controls', async ({ page }) => {
    await page.goto('/settings')

    await page.getByRole('button', { name: '集成' }).click()

    await expect(page.getByText('导入插件')).toBeVisible()
    await expect(page.getByText('扫描路径', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '添加路径' })).toBeVisible()
  })

  test('account tab shows the logged-in demo user', async ({ page }) => {
    // Log in through the API so /api/auth/me returns the demo user.
    const res = await page.request.post('/api/auth/login', {
      data: { email: 'demo@projecthub.dev', password: 'demo1234' },
    })
    expect(res.status()).toBe(200)

    await page.goto('/settings')
    await page.getByRole('button', { name: '账户' }).click()

    await expect(page.getByText('demo@projecthub.dev').first()).toBeVisible()
    await expect(page.getByText('Demo User').first()).toBeVisible()
  })
})
