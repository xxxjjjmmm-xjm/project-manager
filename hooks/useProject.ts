'use client'

import useSWR from 'swr'
import type { ProjectDetailData } from '@/lib/types'

interface ProjectEnvelope {
  success: boolean
  data?: ProjectDetailData | null
  error?: { message?: string } | null
}

const fetcher = async (url: string): Promise<ProjectDetailData> => {
  const res = await fetch(url)
  const json = (await res.json()) as ProjectEnvelope
  if (json.success && json.data) return json.data
  throw new Error(json.error?.message || 'Not found')
}

export function useProject(id: string | undefined) {
  const key = id ? '/api/projects/' + id : null
  const { data, isLoading, error, mutate } = useSWR<ProjectDetailData>(key, fetcher)

  const update = async (body: Record<string, unknown>): Promise<ProjectEnvelope> => {
    if (!id) throw new Error('No project id')
    const res = await fetch('/api/projects/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = (await res.json()) as ProjectEnvelope
    if (json.success && json.data) {
      await mutate(json.data, false)
      return json
    }
    throw new Error(json.error?.message || 'Update failed')
  }

  const archive = async (): Promise<ProjectEnvelope> => {
    if (!id) throw new Error('No project id')
    const res = await fetch('/api/projects/' + id, { method: 'DELETE' })
    const json = (await res.json()) as ProjectEnvelope
    if (json.success) {
      const next: ProjectDetailData | undefined = data
        ? { ...data, isArchived: true, archivedAt: new Date().toISOString() }
        : undefined
      if (next) await mutate(next, false)
      return json
    }
    throw new Error(json.error?.message || 'Archive failed')
  }

  const purge = async (): Promise<ProjectEnvelope> => {
    if (!id) throw new Error('No project id')
    const res = await fetch('/api/projects/' + id + '/purge', { method: 'POST' })
    const json = (await res.json()) as ProjectEnvelope
    if (!json.success) throw new Error(json.error?.message || 'Purge failed')
    return json
  }

  return {
    project: data ?? null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch: () => mutate(),
    update,
    archive,
    purge,
  }
}
