import { test, expect, type Page } from '@playwright/test'

/** Locate the value element inside a stat card identified by its label. */
function statValue(page: Page, label: string) {
  const card = page.locator('div.rounded-2xl', { hasText: label })
  return card.locator('p.text-3xl')
}

test.describe('Dashboard', () => {
  test('shows stat cards with seeded totals', async ({ page }) => {
    await page.goto('/')

    await expect(statValue(page, '项目总数')).toHaveText('3')
    await expect(statValue(page, '任务总数')).toHaveText('5')
    await expect(statValue(page, '完成率')).toHaveText('20%')

    // Labels are visible in Chinese
    await expect(page.getByText('项目总数')).toBeVisible()
    await expect(page.getByText('任务总数')).toBeVisible()
    await expect(page.getByText('完成率')).toBeVisible()
  })

  test('shows health, today tasks and recent activity sections', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('项目健康度')).toBeVisible()
    await expect(page.getByText('今日任务')).toBeVisible()
    await expect(page.getByText('最近动态')).toBeVisible()
  })
})
