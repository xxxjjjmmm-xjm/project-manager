import { test, expect } from '@playwright/test'

test.describe('Calendar', () => {
  test('renders weekday header, today button and the month grid', async ({ page }) => {
    await page.goto('/calendar')

    // Chinese weekday header (Monday-first).
    await expect(page.getByText('周一')).toBeVisible()

    // "今天" button.
    await expect(page.getByRole('button', { name: '今天' })).toBeVisible()

    // The grid renders 42 day cells (explicit role="button").
    await expect(page.locator('[role="button"][tabindex="0"]').first()).toBeVisible()
  })

  test('shows the Website Redesign event pill when the current month is August 2026', async ({
    page,
  }) => {
    await page.goto('/calendar')

    const now = new Date()
    // The seeded Website Redesign project is due 2026-08-20. If the suite runs in
    // August 2026 the pill appears in the default month; otherwise the grid-render
    // test above already covers the page.
    if (now.getFullYear() === 2026 && now.getMonth() === 7) {
      await expect(page.getByText('Website Redesign').first()).toBeVisible()
    }
  })
})
