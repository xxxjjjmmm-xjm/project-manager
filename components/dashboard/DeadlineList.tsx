'use client'

import { useI18n } from '@/lib/i18n/context'
import { getDayDiff, relativeTime } from '@/lib/time'
import type { DeadlineData } from '@/lib/types'

interface DeadlineItem {
  id: string
  title: string
  dueDate: string | null
  projectName: string | null
}

function toItems(deadlines: DeadlineData): DeadlineItem[] {
  const projectItems: DeadlineItem[] = deadlines.projects.map((p) => ({
    id: `p-${p.id}`,
    title: p.name,
    dueDate: p.dueDate,
    projectName: null,
  }))
  const taskItems: DeadlineItem[] = deadlines.tasks.map((task) => ({
    id: `t-${task.id}`,
    title: task.title,
    dueDate: task.dueDate,
    projectName: task.project?.name ?? null,
  }))
  return [...projectItems, ...taskItems].sort((a, b) => {
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
}

export function DeadlineList({ deadlines }: { deadlines: DeadlineData }) {
  const { t, locale } = useI18n()
  const items = toItems(deadlines)

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-5">
      <h3 className="mb-4 text-sm font-semibold text-zinc-200">
        {t.dashboard.upcomingDeadlines}
      </h3>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">{t.dashboard.noDeadlines}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const diff = getDayDiff(item.dueDate)
            const timeColor =
              diff < 0
                ? 'text-red-400'
                : diff <= 3
                  ? 'text-amber-400'
                  : 'text-zinc-400'
            return (
              <li key={item.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-100">{item.title}</p>
                  {item.projectName && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {item.projectName}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 text-xs font-medium tabular-nums ${timeColor}`}
                >
                  {relativeTime(item.dueDate, locale)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
