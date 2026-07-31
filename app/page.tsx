'use client'
import { StatCard } from '@/components/dashboard/StatCard'
import { TechBreakdown } from '@/components/dashboard/TechBreakdown'
import { RecentProjects } from '@/components/dashboard/RecentProjects'
import { ActiveProjects } from '@/components/dashboard/ActiveProjects'
import { Loading } from '@/components/shared/Loading'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { useStats } from '@/hooks/useStats'

export default function DashboardPage() {
  const { stats, isLoading, error } = useStats()
  if (isLoading) return <Loading rows={6} />
  if (error) return <div className="text-red-500 p-6">{error}</div>
  if (!stats) return null

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        <h2 className="text-xl font-bold mb-4">Dashboard</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Projects" value={stats.total} />
          <StatCard label="Web" value={stats.byType.web || 0} />
          <StatCard label="CLI" value={stats.byType.cli || 0} />
          <StatCard label="Libraries" value={stats.byType.library || 0} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div><h3 className="text-sm font-semibold mb-3">Top Technologies</h3><TechBreakdown byTech={stats.byTech} /></div>
          <div className="space-y-6">
            <RecentProjects projects={stats.recentlyAdded} title="Recently Added" />
            <ActiveProjects projects={stats.recentlyActive} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
