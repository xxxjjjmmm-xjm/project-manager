'use client'

import useSWR from 'swr'
import type { TaskItem } from '@/lib/types'

interface TasksResponse {
  items: TaskItem[]
  total: number
  page: number
  totalPages: number
}

interface TasksEnvelope {
  success: boolean
  data?: TasksResponse | null
  error?: { message?: string } | null
}

const fetcher = async (url: string): Promise<TasksResponse> => {
  const res = await fetch(url)
  const json = (await res.json()) as TasksEnvelope
  if (json.success && json.data) return json.data
  throw new Error(json.error?.message || 'Failed to load tasks')
}

export function useTasks(projectId: string | undefined) {
  const key = projectId
    ? '/api/tasks?projectId=' + encodeURIComponent(projectId) + '&limit=100'
    : null
  const { data, isLoading, error, mutate } = useSWR<TasksResponse>(key, fetcher)
  const tasks = data?.items ?? []

  const moveTask = async (taskId: string, status: string): Promise<void> => {
    if (!data) return
    const previous = data
    const optimistic: TasksResponse = {
      ...data,
      items: data.items.map((task) =>
        task.id === taskId ? { ...task, status } : task
      ),
    }
    await mutate(optimistic, false)
    try {
      const res = await fetch('/api/tasks/' + taskId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = (await res.json()) as { success: boolean; error?: { message?: string } | null }
      if (!json.success) throw new Error(json.error?.message || 'Failed to move task')
      await mutate()
    } catch (err) {
      await mutate(previous, false)
      throw err
    }
  }

  return {
    tasks,
    isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    mutate,
    moveTask,
  }
}
