import { test, expect } from '@playwright/test'

test.describe('Search', () => {
  test('finds Website Redesign when typing "web"', async ({ page }) => {
    await page.goto('/search')

    const input = page.getByPlaceholder('搜索项目、任务和文件...')
    await input.fill('web')

    // Project result section heading.
    await expect(page.locator('h2').filter({ hasText: '项目' }).first()).toBeVisible()
    await expect(page.getByText('Website Redesign')).toBeVisible()
  })

  test('shows the no-results state for an unknown query', async ({ page }) => {
    await page.goto('/search')

    const input = page.getByPlaceholder('搜索项目、任务和文件...')
    await input.fill('zzzznope')

    await expect(page.getByText('未找到相关内容')).toBeVisible()
  })
})
