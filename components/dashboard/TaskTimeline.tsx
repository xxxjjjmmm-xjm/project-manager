'use client'

import { StatusBadge } from '@/components/shared/StatusBadge'
import { useI18n } from '@/lib/i18n/context'
import { relativeTime } from '@/lib/time'
import type { DashboardTask } from '@/lib/types'

interface TaskTimelineProps {
  tasks: DashboardTask[]
}

export function TaskTimeline({ tasks }: TaskTimelineProps) {
  const { t, locale } = useI18n()

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-5">
      <h3 className="mb-4 text-sm font-semibold text-zinc-200">
        {t.dashboard.todayTasks}
      </h3>

      {tasks.length === 0 ? (
        <p className="text-sm text-zinc-500">{t.dashboard.noTasksToday}</p>
      ) : (
        <ol className="relative space-y-5 border-l border-white/[0.06] pl-4">
          {tasks.map((task) => (
            <li key={task.id} className="relative">
              <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-[#3B82F6]" />
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-medium text-zinc-100">
                  {task.title}
                </p>
                <StatusBadge status={task.status} size="sm" t={t} />
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                {task.project && <span className="truncate">{task.project.name}</span>}
                {task.dueDate && (
                  <span className="shrink-0 tabular-nums">
                    {relativeTime(task.dueDate, locale)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
