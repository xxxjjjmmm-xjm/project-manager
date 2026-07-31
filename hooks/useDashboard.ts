'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import {
  DASHBOARD_STATS_KEY,
  DASHBOARD_TASKS_KEY,
  DASHBOARD_DEADLINES_KEY,
  DASHBOARD_ACTIVITY_KEY,
} from '@/lib/keys/dashboard.keys'
import type {
  ActivityItem,
  DashboardStats,
  DashboardTask,
  DeadlineData,
} from '@/lib/types'

const fetcher = <T>(url: string): Promise<T> =>
  fetch(url)
    .then((r) => r.json())
    .then((d: { data: T }) => d.data)

const EMPTY_STATS: DashboardStats = {
  totalProjects: 0,
  activeProjects: 0,
  totalTasks: 0,
  completedTasks: 0,
  completionRate: 0,
  totalMembers: 0,
  statusDistribution: [],
  priorityDistribution: [],
}

const EMPTY_DEADLINES: DeadlineData = { projects: [], tasks: [] }

export function useDashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError, mutate: mutateStats } =
    useSWR<DashboardStats>(DASHBOARD_STATS_KEY, fetcher)
  const { data: todayTasks, isLoading: tasksLoading, error: tasksError, mutate: mutateTasks } =
    useSWR<DashboardTask[]>(DASHBOARD_TASKS_KEY, fetcher)
  const { data: deadlines, isLoading: deadlinesLoading, error: deadlinesError, mutate: mutateDeadlines } =
    useSWR<DeadlineData>(DASHBOARD_DEADLINES_KEY, fetcher)
  const { data: activities, isLoading: activitiesLoading, error: activitiesError, mutate: mutateActivities } =
    useSWR<ActivityItem[]>(DASHBOARD_ACTIVITY_KEY, fetcher)

  const isLoading =
    statsLoading || tasksLoading || deadlinesLoading || activitiesLoading
  const isError = Boolean(
    statsError || tasksError || deadlinesError || activitiesError
  )

  const retry = useCallback(() => {
    void mutateStats()
    void mutateTasks()
    void mutateDeadlines()
    void mutateActivities()
  }, [mutateStats, mutateTasks, mutateDeadlines, mutateActivities])

  return {
    stats: stats ?? EMPTY_STATS,
    todayTasks: todayTasks ?? [],
    deadlines: deadlines ?? EMPTY_DEADLINES,
    activities: activities ?? [],
    isLoading,
    isError,
    retry,
  }
}
