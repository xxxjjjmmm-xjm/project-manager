import { test, expect } from '@playwright/test'

test.describe('Project Detail', () => {
  test('shows the five tabs and kanban with seeded tasks', async ({ page, request }) => {
    // Grab a real project id from the API so the test is not coupled to a UUID.
    const listRes = await request.get('/api/projects?limit=100')
    expect(listRes.status()).toBe(200)
    const listJson = (await listRes.json()) as {
      data: { items: Array<{ id: string; name: string }> }
    }
    const items = listJson.data.items
    expect(items.length).toBeGreaterThan(0)

    const project = items.find((p) => p.name === 'Website Redesign') ?? items[0]
    expect(project).toBeTruthy()

    await page.goto(`/projects/${project.id}`)

    // Wait for the project to load.
    await expect(page.locator('h1', { hasText: project.name })).toBeVisible()

    // All five tabs exist.
    for (const tab of ['概述', '看板', '文件', '动态', '设置']) {
      await expect(page.getByRole('button', { name: tab })).toBeVisible()
    }

    // Switch to the kanban tab.
    await page.getByRole('button', { name: '看板' }).click()

    // Kanban columns (zh labels).
    await expect(page.getByText('待办').first()).toBeVisible()
    await expect(page.getByText('进行中').first()).toBeVisible()
    await expect(page.getByText('评审中').first()).toBeVisible()
    await expect(page.getByText('已完成').first()).toBeVisible()

    // Seeded tasks for Website Redesign.
    if (project.name === 'Website Redesign') {
      await expect(page.getByText('Design mockups')).toBeVisible()
      await expect(page.getByText('Frontend implementation')).toBeVisible()
    }
  })
})
