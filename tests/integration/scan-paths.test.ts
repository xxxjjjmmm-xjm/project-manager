// @vitest-environment node
import { describe, it, expect } from 'vitest'

const BASE = 'http://localhost:3000'

describe('Scan Paths API', () => {
  it('GET returns scan paths list', async () => {
    const res = await fetch(BASE + '/api/plugins/scan-paths')
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)
  })

  it('POST creates a new scan path and DELETE removes it', async () => {
    // Create
    const createRes = await fetch(BASE + '/api/plugins/scan-paths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'd:/vitest-test-' + Date.now() }),
    })
    const createJson = await createRes.json()
    expect(createJson.success).toBe(true)
    expect(createJson.data.id).toBeTruthy()

    // Delete
    const delRes = await fetch(BASE + '/api/plugins/scan-paths/' + createJson.data.id, { method: 'DELETE' })
    expect((await delRes.json()).success).toBe(true)
  })

  it('POST rejects empty path with validation error', async () => {
    const res = await fetch(BASE + '/api/plugins/scan-paths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '' }),
    })
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('PATCH toggles enabled flag', async () => {
    const createRes = await fetch(BASE + '/api/plugins/scan-paths', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'd:/patch-test-' + Date.now() }),
    })
    const { data } = await createRes.json()

    const res = await fetch(BASE + '/api/plugins/scan-paths/' + data.id, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: false }),
    })
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.enabled).toBe(false)

    // Clean up
    await fetch(BASE + '/api/plugins/scan-paths/' + data.id, { method: 'DELETE' })
  })
})
