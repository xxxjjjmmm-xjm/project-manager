import { useState, useEffect } from 'react'
import type { StatsData } from '@/lib/types'

export function useStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = () => {
    setIsLoading(true)
    fetch('/api/stats')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setStats(json.data)
        else setError(json.error?.message || 'Failed to load stats')
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { fetchStats() }, [])

  return { stats, isLoading, error, refetch: fetchStats }
}
