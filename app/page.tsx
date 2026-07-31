'use client'
import { StatCard } from '@/components/dashboard/StatCard'
import { TechBreakdown } from '@/components/dashboard/TechBreakdown'
import { RecentProjects } from '@/components/dashboard/RecentProjects'
import { ActiveProjects } from '@/components/dashboard/ActiveProjects'
import { Loading } from '@/components/shared/Loading'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { useStats } from '@/hooks/useStats'
import { useI18n } from '@/lib/i18n/context'

export default function DashboardPage() {
  const { t } = useI18n()
  const { stats, isLoading, error } = useStats()
  if (isLoading) return <Loading rows={6} />
  if (error) return <div className="text-red-500 p-6">{error}</div>
  if (!stats) return null

  const typeMap: Record<string, string> = { web: t.dashboard.web, cli: t.dashboard.cli, library: t.dashboard.libraries, mobile: t.dashboard.mobile, desktop: t.dashboard.desktop, script: t.dashboard.script, other: t.dashboard.other }

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        <h2 className="text-xl font-bold">{t.dashboard.title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label={t.dashboard.totalProjects} value={stats.total} />
          {Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([type, count]) => (
            <StatCard key={type} label={typeMap[type] || type} value={count} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div><h3 className="text-sm font-semibold mb-3">{t.dashboard.topTechnologies}</h3><TechBreakdown byTech={stats.byTech} /></div>
          <div className="space-y-6">
            <RecentProjects projects={stats.recentlyAdded} title={t.dashboard.recentlyAdded} />
            <ActiveProjects projects={stats.recentlyActive} title={t.dashboard.recentlyActive} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
