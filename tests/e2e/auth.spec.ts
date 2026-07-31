import { test, expect } from '@playwright/test'

test.describe('Auth API', () => {
  test('login succeeds with the demo credentials', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'demo@projecthub.dev', password: 'demo1234' },
    })
    expect(res.status()).toBe(200)

    const json = (await res.json()) as {
      success: boolean
      data: { user: { email: string } }
    }
    expect(json.success).toBe(true)
    expect(json.data.user.email).toBe('demo@projecthub.dev')
  })

  test('login fails with a wrong password', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'demo@projecthub.dev', password: 'wrong-password' },
    })
    expect(res.status()).toBe(401)

    const json = (await res.json()) as { success: boolean }
    expect(json.success).toBe(false)
  })

  test('me returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.get('/api/auth/me')
    expect(res.status()).toBe(401)

    const json = (await res.json()) as { success: boolean }
    expect(json.success).toBe(false)
  })
})
