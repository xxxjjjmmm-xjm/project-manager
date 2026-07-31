import { useState, useEffect, useCallback } from 'react'
import type { TagItem } from '@/lib/types'

export function useTags() {
  const [tags, setTags] = useState<TagItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTags = useCallback(async () => {
    setIsLoading(true)
    const res = await fetch('/api/tags?withCount=true')
    const json = await res.json()
    if (json.success) setTags(json.data)
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchTags() }, [fetchTags])

  const create = async (name: string, color?: string) => {
    const res = await fetch('/api/tags', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, color }),
    })
    const json = await res.json()
    if (json.success) fetchTags()
    return json
  }

  const remove = async (id: string) => {
    await fetch(`/api/tags/${id}`, { method: 'DELETE' })
    fetchTags()
  }

  return { tags, isLoading, create, remove, refetch: fetchTags }
}
