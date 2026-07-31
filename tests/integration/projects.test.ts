// @vitest-environment node
import { describe, it, expect } from 'vitest'

const BASE = 'http://localhost:3000'

describe('Projects API', () => {
  it('GET returns paginated project list', async () => {
    const res = await fetch(BASE + '/api/projects')
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)
    expect(json.pagination).toBeTruthy()
    expect(typeof json.pagination.total).toBe('number')
  })

  it('GET with search returns filtered results', async () => {
    const res = await fetch(BASE + '/api/projects?search=nonexistentxyz&limit=5')
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data).toEqual([])
  })

  it('GET with type filter works', async () => {
    const res = await fetch(BASE + '/api/projects?type=web&limit=5')
    const json = await res.json()
    expect(json.success).toBe(true)
    if (json.data.length > 0) {
      expect(json.data.every((p: Record<string, unknown>) => p.type === 'web')).toBe(true)
    }
  })

  it('GET /api/projects/[id] returns detail or 404', async () => {
    // Try a nonexistent ID
    const res = await fetch(BASE + '/api/projects/nonexistent-id')
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('PROJECT_NOT_FOUND')
  })

  it('Project detail endpoints return content', async () => {
    // Get a real project from list
    const listRes = await fetch(BASE + '/api/projects?limit=1')
    const list = await listRes.json()
    if (list.data.length === 0) return

    const id = list.data[0].id

    // Get detail
    const detailRes = await fetch(BASE + '/api/projects/' + id)
    const detail = await detailRes.json()
    expect(detail.success).toBe(true)
    expect(detail.data.id).toBe(id)

    // README
    const readmeRes = await fetch(BASE + '/api/projects/' + id + '/readme')
    expect((await readmeRes.json()).success).toBe(true)

    // Claude MD
    const claudeRes = await fetch(BASE + '/api/projects/' + id + '/claude-md')
    expect((await claudeRes.json()).success).toBe(true)

    // Git commits
    const commitsRes = await fetch(BASE + '/api/projects/' + id + '/git-commits')
    expect((await commitsRes.json()).success).toBe(true)
  })
})
