'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import type { TaskItem } from '@/lib/types'

export interface TaskListFilters {
  projectId?: string
  status?: string
  priority?: string
  myTasks?: boolean
}

export interface CreateTaskInput {
  projectId: string
  title: string
  status?: string
  priority?: string
  dueDate?: string
}

type TaskPatch = Partial<
  Pick<TaskItem, 'status' | 'priority' | 'title' | 'description' | 'dueDate' | 'assigneeId'>
>

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

/**
 * Auth lands in Phase 8 — until then the current user is the seeded default user.
 * NOTE: GET /api/tasks ignores `myTasks` in the service layer, so the only
 * reliable way to filter "my tasks" is `assigneeId`.
 */
const DEFAULT_USER_ID = 'default-user'

const fetcher = async (url: string): Promise<TasksResponse> => {
  const res = await fetch(url)
  const json = (await res.json()) as TasksEnvelope
  if (json.success && json.data) return json.data
  throw new Error(json.error?.message || 'Failed to load tasks')
}

function buildKey(filters: TaskListFilters): string {
  const params = new URLSearchParams()
  if (filters.projectId) params.set('projectId', filters.projectId)
  if (filters.status) params.set('status', filters.status)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.myTasks) params.set('assigneeId', DEFAULT_USER_ID)
  params.set('limit', '100')
  return '/api/tasks?' + params.toString()
}

export function useTaskList(filters: TaskListFilters) {
  const key = buildKey(filters)
  const { data, isLoading, error, mutate } = useSWR<TasksResponse>(key, fetcher, {
    keepPreviousData: true,
  })

  const tasks = data?.items ?? []

  const patchTask = useCallback(
    async (taskId: string, patch: TaskPatch): Promise<void> => {
      const previous = data
      if (!previous) return
      await mutate(
        (current) => {
          if (!current) return current
          return {
            ...current,
            items: current.items.map((task) =>
              task.id === taskId ? { ...task, ...patch } : task
            ),
          }
        },
        false
      )
      try {
        const res = await fetch('/api/tasks/' + taskId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        })
        const json = (await res.json()) as {
          success: boolean
          error?: { message?: string } | null
        }
        if (!json.success) throw new Error(json.error?.message || 'Failed to update task')
        await mutate()
      } catch (err) {
        await mutate(previous, false)
        throw err
      }
    },
    [data, mutate]
  )

  const moveTask = useCallback(
    (taskId: string, status: string) => patchTask(taskId, { status }),
    [patchTask]
  )

  const toggleDone = useCallback(
    (task: TaskItem) =>
      patchTask(task.id, { status: task.status === 'DONE' ? 'TODO' : 'DONE' }),
    [patchTask]
  )

  const createTask = useCallback(
    async (input: CreateTaskInput): Promise<TaskItem> => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const json = (await res.json()) as {
        success: boolean
        data?: TaskItem | null
        error?: { message?: string } | null
      }
      if (!json.success || !json.data)
        throw new Error(json.error?.message || 'Failed to create task')
      await mutate()
      return json.data
    },
    [mutate]
  )

  const retry = useCallback(() => {
    void mutate()
  }, [mutate])

  return {
    tasks,
    isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    mutate,
    moveTask,
    toggleDone,
    createTask,
    retry,
  }
}
