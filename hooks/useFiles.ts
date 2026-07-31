'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import type { FileItem } from '@/lib/types'

export interface FilesResponse {
  items: FileItem[]
  total: number
  page: number
  totalPages: number
}

interface FilesEnvelope {
  success: boolean
  data?: FilesResponse | null
  error?: { message?: string } | null
}

const fetcher = async (url: string): Promise<FilesResponse> => {
  const res = await fetch(url)
  const json = (await res.json()) as FilesEnvelope
  if (json.success && json.data) return json.data
  throw new Error(json.error?.message || 'Failed to load files')
}

function buildKey(search: string): string {
  const params = new URLSearchParams()
  if (search.trim()) params.set('search', search.trim())
  params.set('limit', '100')
  return '/api/files?' + params.toString()
}

export function useFiles(search = '') {
  const key = buildKey(search)
  const { data, isLoading, error, mutate } = useSWR<FilesResponse>(key, fetcher, {
    keepPreviousData: true,
  })

  const deleteFile = useCallback(
    async (fileId: string): Promise<void> => {
      const res = await fetch('/api/files/' + fileId, { method: 'DELETE' })
      const json = (await res.json()) as {
        success: boolean
        error?: { message?: string } | null
      }
      if (!json.success) throw new Error(json.error?.message || 'Failed to delete file')
      await mutate()
    },
    [mutate]
  )

  const retry = useCallback(() => {
    void mutate()
  }, [mutate])

  return {
    files: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    deleteFile,
    retry,
  }
}
