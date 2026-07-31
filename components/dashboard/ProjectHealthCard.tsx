'use client'

import { ProgressBar } from '@/components/shared/ProgressBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useI18n } from '@/lib/i18n/context'
import type { DashboardStats } from '@/lib/types'

interface ProjectHealthCardProps {
  stats: DashboardStats
}

export function ProjectHealthCard({ stats }: ProjectHealthCardProps) {
  const { t } = useI18n()
  const total = stats.totalProjects
  const distribution = stats.statusDistribution ?? []

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-5">
      <h3 className="mb-4 text-sm font-semibold text-zinc-200">
        {t.dashboard.projectHealth}
      </h3>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-zinc-400">
            {t.dashboard.overallCompletion}
          </span>
          <span className="text-sm font-semibold tabular-nums text-white">
            {stats.completionRate}%
          </span>
        </div>
        <ProgressBar progress={stats.completionRate} />
      </div>

      {distribution.length === 0 ? (
        <p className="text-sm text-zinc-500">{t.dashboard.noData}</p>
      ) : (
        <ul className="space-y-3">
          {distribution.map((entry) => (
            <li key={entry.status} className="flex items-center gap-3">
              <div className="w-28 shrink-0">
                <StatusBadge status={entry.status} size="sm" t={t} />
              </div>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-[#3B82F6]"
                  style={{
                    width: `${total > 0 ? (entry.count / total) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs tabular-nums text-zinc-500">
                {entry.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
