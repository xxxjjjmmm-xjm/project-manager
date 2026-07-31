'use client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/shared/Badge'
import { Archive, Trash2 } from 'lucide-react'
import type { ProjectDetail } from '@/lib/types'

export function ProjectDetailHeader({ project, onArchive, onPurge }: {
  project: ProjectDetail; onArchive: () => void; onPurge: () => void
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {project.name}<Badge variant="type">{project.type}</Badge>
          {project.isArchived && <Badge variant="default">Archived</Badge>}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{project.path}</p>
      </div>
      <div className="flex gap-2">
        {!project.isArchived
          ? <Button variant="outline" size="sm" onClick={onArchive}><Archive className="h-4 w-4 mr-1" />Archive</Button>
          : <Button variant="destructive" size="sm" onClick={onPurge}><Trash2 className="h-4 w-4 mr-1" />Purge</Button>}
      </div>
    </div>
  )
}
