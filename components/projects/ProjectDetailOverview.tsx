'use client'
import { Badge } from '@/components/shared/Badge'
import type { ProjectDetail } from '@/lib/types'

export function ProjectDetailOverview({ project, readme }: {
  project: ProjectDetail; readme: string | null
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetaCard label="Type" value={<Badge variant="type">{project.type}</Badge>} />
        <MetaCard label="Total Commits" value={project.totalCommits.toString()} />
        <MetaCard label="Remote" value={project.remoteUrl || 'N/A'} />
        <MetaCard label="First Seen" value={new Date(project.firstSeenAt).toLocaleDateString()} />
        <MetaCard label="Last Scanned" value={project.lastScannedAt ? new Date(project.lastScannedAt).toLocaleDateString() : 'N/A'} />
        <MetaCard label="Last Commit" value={project.lastCommitAt ? new Date(project.lastCommitAt).toLocaleDateString() : 'N/A'} />
      </div>
      <div className="flex flex-wrap gap-1">
        {project.techStack.map((t) => <Badge key={t} variant="tech">{t}</Badge>)}
      </div>
      {project.description && <p className="text-sm">{project.description}</p>}
      {readme ? (
        <div className="border rounded-lg p-4 bg-muted/20 max-h-96 overflow-auto">
          <pre className="text-sm whitespace-pre-wrap font-mono">{readme}</pre>
        </div>
      ) : <p className="text-sm text-muted-foreground">No README found</p>}
    </div>
  )
}

function MetaCard({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="border rounded-lg p-3"><p className="text-xs text-muted-foreground">{label}</p><div className="text-sm font-medium mt-0.5">{value}</div></div>
}
