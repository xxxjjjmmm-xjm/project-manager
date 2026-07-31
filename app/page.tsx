'use client'

import { CheckCircle2, FolderKanban, ListTodo, Loader } from 'lucide-react'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { DeadlineList } from '@/components/dashboard/DeadlineList'
import { ProjectHealthCard } from '@/components/dashboard/ProjectHealthCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { TaskTimeline } from '@/components/dashboard/TaskTimeline'
import { useDashboard } from '@/hooks/useDashboard'
import { useI18n } from '@/lib/i18n/context'

const SKELETON_STAT_CARDS = [0, 1, 2, 3] as const

function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="loading">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="h-4 w-72 animate-pulse rounded bg-white/[0.06]" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SKELETON_STAT_CARDS.map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="h-64 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]" />
          <div className="h-48 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]" />
        </div>
        <div className="space-y-6">
          <div className="h-48 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]" />
          <div className="h-64 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { t } = useI18n()
  const { stats, todayTasks, deadlines, activities, isLoading, isError, retry } =
    useDashboard()

  if (isLoading) return <DashboardSkeleton />

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111113] px-6 py-16 text-center">
        <p className="text-sm text-zinc-400">{t.dashboard.loadFailed}</p>
        <button
          type="button"
          onClick={retry}
          className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
        >
          {t.common.retry}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">{t.dashboard.homeTitle}</h1>
        <p className="text-sm text-zinc-400">{t.dashboard.homeSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FolderKanban size={20} />}
          label={t.dashboard.totalProjects}
          value={stats.totalProjects}
        />
        <StatCard
          icon={<Loader size={20} />}
          label={t.dashboard.activeProjects}
          value={stats.activeProjects}
        />
        <StatCard
          icon={<ListTodo size={20} />}
          label={t.dashboard.totalTasks}
          value={stats.totalTasks}
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label={t.dashboard.completionRate}
          value={`${stats.completionRate}%`}
          accent
          sub={`${stats.completedTasks}/${stats.totalTasks}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <ProjectHealthCard stats={stats} />
          <TaskTimeline tasks={todayTasks} />
        </div>
        <div className="space-y-6">
          <DeadlineList deadlines={deadlines} />
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  )
}
