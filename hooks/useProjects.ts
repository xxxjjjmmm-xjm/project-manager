import { useState, useEffect, useCallback } from 'react'
import type { ProjectListItem, PaginationMeta, ProjectListQuery } from '@/lib/types'
import { useDebounce } from './useDebounce'

export function useProjects(query: ProjectListQuery = {}) {
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, totalPages: 0, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const debouncedSearch = useDebounce(query.search, 300)

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (query.type) params.set('type', query.type)
    if (query.tag) params.set('tag', query.tag)
    if (query.isArchived !== undefined) params.set('isArchived', String(query.isArchived))
    params.set('page', String(query.page || 1))
    params.set('limit', String(query.limit || 20))

    try {
      const res = await fetch("/api/projects?" + params.toString())
      const json = await res.json()
      if (json.success) { setProjects(json.data); setPagination(json.pagination); setError(null) }
      else setError(json.error?.message || 'Failed to load')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally { setIsLoading(false) }
  }, [debouncedSearch, query.type, query.tag, query.isArchived, query.page, query.limit])

  useEffect(() => { fetchProjects() }, [fetchProjects])
  return { projects, pagination, isLoading, error, refetch: fetchProjects }
}
