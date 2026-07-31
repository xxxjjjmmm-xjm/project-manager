import { useState, useEffect, useCallback } from 'react'
import type { ProjectDetail } from '@/lib/types'

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProject = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const res = await fetch("/api/projects/" + id)
      const json = await res.json()
      if (json.success) { setProject(json.data); setError(null) }
      else setError(json.error?.message || 'Not found')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally { setIsLoading(false) }
  }, [id])

  useEffect(() => { fetchProject() }, [fetchProject])

  const update = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/projects/" + id, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    const json = await res.json()
    if (json.success) setProject(json.data)
    return json
  }

  const archive = async () => {
    const res = await fetch("/api/projects/" + id, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) setProject((p) => p ? { ...p, isArchived: true } : p)
    return json
  }

  const purge = async () => {
    await fetch("/api/projects/" + id + "/purge", { method: 'POST' })
  }

  return { project, isLoading, error, refetch: fetchProject, update, archive, purge }
}
