'use client'

import useSWR from 'swr'
import type { SearchResults } from '@/lib/types'

interface SearchEnvelope {
  success: boolean
  data?: SearchResults | null
  error?: { message?: string } | null
}

const EMPTY_RESULTS: SearchResults = { projects: [], tasks: [], files: [] }

const fetcher = async (url: string): Promise<SearchResults> => {
  const res = await fetch(url)
  const json = (await res.json()) as SearchEnvelope
  if (json.success && json.data) return json.data
  throw new Error(json.error?.message || 'Search failed')
}

export function useSearch(q: string, limit = 10) {
  const trimmed = q.trim()
  const key = trimmed
    ? '/api/search?q=' + encodeURIComponent(trimmed) + '&limit=' + limit
    : null

  const { data, isLoading, error } = useSWR<SearchResults>(key, fetcher, {
    keepPreviousData: true,
  })

  return {
    results: data ?? EMPTY_RESULTS,
    isLoading: Boolean(trimmed) && isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
  }
}
