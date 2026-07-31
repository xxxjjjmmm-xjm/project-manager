'use client'

import useSWR from 'swr'
import { relativeTime } from '@/lib/time'
import { useI18n } from '@/lib/i18n/context'
import type { ActivityItem } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

interface ActivityEnvelope {
  success: boolean
  data?: ActivityItem[] | null
  error?: { message?: string } | null
}

const fetcher = async (url: string): Promise<ActivityItem[]> => {
  const res = await fetch(url)
  const json = (await res.json()) as ActivityEnvelope
  if (json.success && json.data) return json.data
  throw new Error(json.error?.message || 'Failed to load activity')
}

function parseMeta(raw: string): { name?: string } {
  try {
    const parsed = JSON.parse(raw || '{}') as Record<string, unknown>
    const name =
      typeof parsed.name === 'string'
        ? parsed.name
        : typeof parsed.title === 'string'
          ? parsed.title
          : typeof parsed.projectName === 'string'
            ? parsed.projectName
            : undefined
    return { name }
  } catch {
    return {}
  }
}

export function ProjectActivityTab({ projectId, t }: { projectId: string; t: typeof en }) {
  const { locale } = useI18n()
  const { data, isLoading, error } = useSWR<ActivityItem[]>(
    '/api/projects/' + projectId + '/activity',
    fetcher
  )
  const activities = data ?? []

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-red-400">{error instanceof Error ? error.message : String(error)}</p>
  }

  if (activities.length === 0) {
    return <p className="text-sm text-zinc-500">{t.detail.noActivity}</p>
  }

  return (
    <ul className="space-y-2">
      {activities.map((activity) => {
        const meta = parseMeta(activity.metadata)
        return (
          <li
            key={activity.id}
            className="flex items-start justify-between gap-3 rounded-2xl border border-white/[0.06] bg-[#111113] px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm text-zinc-300">
                {activity.actor && <span className="font-medium text-zinc-100">{activity.actor.name} </span>}
                <span className="text-zinc-500">{activity.action}</span>
              </p>
              {meta.name && <p className="mt-0.5 truncate text-xs text-zinc-500">{meta.name}</p>}
            </div>
            <span className="shrink-0 text-xs tabular-nums text-zinc-500">
              {relativeTime(activity.createdAt, locale)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
