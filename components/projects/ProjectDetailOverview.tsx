'use client'
import { Badge } from '@/components/shared/Badge'
import type { ProjectDetail } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

export function ProjectDetailOverview({ project, readme, t }: {
  project: ProjectDetail; readme: string | null; t: typeof en
}) {
  const dm = t.detailMeta
  return (<div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MC label={dm.type} value={<Badge variant="type">{project.type}</Badge>} />
      <MC label={dm.totalCommits} value={project.totalCommits.toString()} />
      <MC label={dm.remote} value={project.remoteUrl || dm.na} />
      <MC label={dm.firstSeen} value={new Date(project.firstSeenAt).toLocaleDateString()} />
      <MC label={dm.lastScanned} value={project.lastScannedAt ? new Date(project.lastScannedAt).toLocaleDateString() : dm.na} />
      <MC label={dm.lastCommit} value={project.lastCommitAt ? new Date(project.lastCommitAt).toLocaleDateString() : dm.na} />
    </div>
    <div className="flex flex-wrap gap-1">{project.techStack.map((s) => <Badge key={s} variant="tech">{s}</Badge>)}</div>
    {project.description && <p className="text-sm">{project.description}</p>}
    {readme ? (
      <div className="border rounded-lg p-4 bg-muted/20 max-h-96 overflow-auto"><pre className="text-sm whitespace-pre-wrap font-mono">{readme}</pre></div>
    ) : <p className="text-sm text-muted-foreground">{t.detail.noReadme}</p>}
  </div>)
}
function MC({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="border rounded-lg p-3"><p className="text-xs text-muted-foreground">{label}</p><div className="text-sm font-medium mt-0.5">{value}</div></div>
}
