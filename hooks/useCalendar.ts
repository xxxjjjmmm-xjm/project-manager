'use client'

import { useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'

export interface CalendarEvent {
  id: string
  title: string
  status: string
  dueDate: string
  projectId: string | null
  projectName: string | null
  type: 'task' | 'project'
}

interface CalendarTask {
  id: string
  projectId: string
  title: string
  status: string
  priority: string
  dueDate: string | null
  assigneeId: string | null
}

interface CalendarProject {
  id: string
  name: string
  status: string
  dueDate: string | null
}

interface CalendarData {
  tasks: CalendarTask[]
  projects: CalendarProject[]
}

interface CalendarEnvelope {
  success: boolean
  data?: CalendarData | null
  error?: { message?: string } | null
}

const fetcher = async (url: string): Promise<CalendarEvent[]> => {
  const res = await fetch(url)
  const json = (await res.json()) as CalendarEnvelope
  if (json.success && json.data) {
    const projectNames: Record<string, string> = {}
    for (const project of json.data.projects ?? []) {
      projectNames[project.id] = project.name
    }
    const taskEvents: CalendarEvent[] = (json.data.tasks ?? [])
      .filter((task) => task.dueDate)
      .map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        dueDate: task.dueDate as string,
        projectId: task.projectId,
        projectName: projectNames[task.projectId] ?? null,
        type: 'task' as const,
      }))
    const projectEvents: CalendarEvent[] = (json.data.projects ?? [])
      .filter((project) => project.dueDate)
      .map((project) => ({
        id: project.id,
        title: project.name,
        status: project.status,
        dueDate: project.dueDate as string,
        projectId: project.id,
        projectName: project.name,
        type: 'project' as const,
      }))
    return [...taskEvents, ...projectEvents]
  }
  throw new Error(json.error?.message || 'Failed to load calendar')
}

export function currentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function shiftMonthKey(month: string, delta: number): string {
  const [year, monthIndex] = month.split('-').map(Number)
  const date = new Date(year, monthIndex - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function useCalendar() {
  const [mounted, setMounted] = useState(false)
  const [month, setMonth] = useState<string>('2000-01')

  useEffect(() => {
    setMonth(currentMonthKey())
    setMounted(true)
  }, [])

  const key = mounted ? '/api/calendar?month=' + encodeURIComponent(month) : null
  const { data, isLoading, error, mutate } = useSWR<CalendarEvent[]>(key, fetcher)

  const retry = useCallback(() => {
    void mutate()
  }, [mutate])

  return {
    month,
    setMonth,
    events: data ?? [],
    isLoading,
    isError: Boolean(error),
    retry,
  }
}
