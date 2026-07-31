'use client'

import { useI18n } from '@/lib/i18n/context'
import { relativeTime } from '@/lib/time'
import type { ActivityItem } from '@/lib/types'

interface ActivityMeta {
  projectName?: unknown
  taskTitle?: unknown
}

function parseMetadata(raw: string): ActivityMeta {
  try {
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
    return { projectName: parsed.projectName, taskTitle: parsed.taskTitle }
  } catch {
    return {}
  }
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const { t, locale } = useI18n()

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-5">
      <h3 className="mb-4 text-sm font-semibold text-zinc-200">
        {t.dashboard.recentActivity}
      </h3>

      {activities.length === 0 ? (
        <p className="text-sm text-zinc-500">{t.dashboard.noActivity}</p>
      ) : (
        <ul className="max-h-96 space-y-4 overflow-y-auto">
          {activities.map((activity) => {
            const meta = parseMetadata(activity.metadata)
            const projectName =
              typeof meta.projectName === 'string' ? meta.projectName : null
            const taskTitle =
              typeof meta.taskTitle === 'string' ? meta.taskTitle : null
            const context = projectName ?? taskTitle

            return (
              <li key={activity.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm leading-snug">
                    {activity.actor && (
                      <span className="font-medium text-zinc-100">
                        {activity.actor.name}{' '}
                      </span>
                    )}
                    <span className="text-zinc-400">
                      {activity.action.toLowerCase()}
                    </span>
                  </p>
                  {context && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {context}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs tabular-nums text-zinc-500">
                  {relativeTime(activity.createdAt, locale)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
