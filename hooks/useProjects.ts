'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ProjectSummary } from '@/lib/types'
import { useDebounce } from './useDebounce'

export interface UseProjectsQuery {
  search?: string
  status?: string
  page?: number
  limit?: number
}

export interface ProjectsPagination {
  page: number
  totalPages: number
  total: number
}

interface ProjectsEnvelope {
  success: boolean
  data?: {
    items?: ProjectSummary[]
    total?: number
    page?: number
    totalPages?: number
  }
  error?: { message?: string } | null
}

export function useProjects(query: UseProjectsQuery = {}) {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [pagination, setPagination] = useState<ProjectsPagination>({
    page: 1,
    totalPages: 0,
    total: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const debouncedSearch = useDebounce(query.search, 300)

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (query.status) params.set('status', query.status)
    params.set('page', String(query.page || 1))
    params.set('limit', String(query.limit || 20))

    try {
      const res = await fetch('/api/projects?' + params.toString())
      const json = (await res.json()) as ProjectsEnvelope
      if (json.success && json.data) {
        setProjects(json.data.items ?? [])
        setPagination({
          page: json.data.page ?? 1,
          totalPages: json.data.totalPages ?? 0,
          total: json.data.total ?? 0,
        })
        setError(null)
      } else {
        setError(json.error?.message || 'Failed to load')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, query.status, query.page, query.limit])

  useEffect(() => {
    void fetchProjects()
  }, [fetchProjects])

  return { projects, pagination, isLoading, error, refetch: fetchProjects }
}
