import { useState, useEffect, useCallback } from 'react'
import type { ScanPathItem } from '@/lib/types'

export function useScanPaths() {
  const [paths, setPaths] = useState<ScanPathItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPaths = useCallback(async () => {
    setIsLoading(true)
    const res = await fetch("/api/scan-paths")
    const json = await res.json()
    if (json.success) setPaths(json.data)
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchPaths() }, [fetchPaths])

  const create = async (path: string) => {
    const res = await fetch("/api/scan-paths", {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path }),
    })
    const json = await res.json()
    if (json.success) fetchPaths()
    return json
  }

  const update = async (id: string, data: { path?: string; enabled?: boolean }) => {
    const res = await fetch("/api/scan-paths/" + id, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    const json = await res.json()
    if (json.success) fetchPaths()
    return json
  }

  const remove = async (id: string) => {
    await fetch("/api/scan-paths/" + id, { method: 'DELETE' })
    fetchPaths()
  }

  return { paths, isLoading, create, update, remove, refetch: fetchPaths }
}
