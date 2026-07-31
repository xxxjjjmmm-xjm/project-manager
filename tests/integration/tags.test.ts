// @vitest-environment node
import { describe, it, expect } from 'vitest'

const BASE = 'http://localhost:3000'

describe('Tags API', () => {
  it('GET returns tags list', async () => {
    const res = await fetch(BASE + '/api/tags')
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)
  })

  it('POST creates tag and DELETE removes it', async () => {
    const name = 'vitest-tag-' + Date.now()
    const createRes = await fetch(BASE + '/api/tags', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const createJson = await createRes.json()
    expect(createJson.success).toBe(true)
    expect(createJson.data.name).toBe(name)

    const delRes = await fetch(BASE + '/api/tags/' + createJson.data.id, { method: 'DELETE' })
    expect((await delRes.json()).success).toBe(true)
  })

  it('GET withCount returns projectCount field', async () => {
    const res = await fetch(BASE + '/api/tags?withCount=true')
    const json = await res.json()
    expect(json.success).toBe(true)
    // All tags should have projectCount field
    if (json.data.length > 0) {
      expect(json.data[0]).toHaveProperty('projectCount')
    }
  })

  it('POST rejects empty name', async () => {
    const res = await fetch(BASE + '/api/tags', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    })
    expect((await res.json()).success).toBe(false)
  })

  it('PATCH updates tag', async () => {
    const createRes = await fetch(BASE + '/api/tags', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'before-' + Date.now() }),
    })
    const { data } = await createRes.json()

    const res = await fetch(BASE + '/api/tags/' + data.id, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'after-' + Date.now() }),
    })
    expect((await res.json()).success).toBe(true)

    await fetch(BASE + '/api/tags/' + data.id, { method: 'DELETE' })
  })
})
