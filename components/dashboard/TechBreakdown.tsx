import { Loading } from '@/components/shared/Loading'

interface TechBreakdownProps {
  byTech: Record<string, number>
  isLoading?: boolean
}

export function TechBreakdown({ byTech, isLoading }: TechBreakdownProps) {
  if (isLoading) return <Loading rows={5} />
  const entries = Object.entries(byTech).sort((a, b) => b[1] - a[1]).slice(0, 10)
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">No data yet</p>
  const max = entries[0][1]
  return (
    <div className="space-y-2">
      {entries.map(([tech, count]) => (
        <div key={tech} className="flex items-center gap-2">
          <span className="text-sm w-24 truncate">{tech}</span>
          <div className="flex-1 bg-secondary rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: Math.max(4, (count / max) * 100) + '%' }} />
          </div>
          <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
        </div>
      ))}
    </div>
  )
}
