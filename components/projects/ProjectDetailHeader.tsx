'use client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/shared/Badge'
import { Archive, Trash2, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { ProjectDetail } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

export function ProjectDetailHeader({ project, onArchive, onPurge, t }: {
  project: ProjectDetail; onArchive: () => void; onPurge: () => void; t: typeof en
}) {
  const [copied, setCopied] = useState(false)
  const copyPath = async () => {
    try { await navigator.clipboard.writeText(project.path); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {project.name}<Badge variant="type">{project.type}</Badge>
          {project.isArchived && <Badge variant="default">{t.projects.archived}</Badge>}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-muted-foreground">{project.path}</p>
          <button onClick={copyPath} className="text-xs text-muted-foreground hover:text-foreground transition-colors" title={t.common.copyPath}>
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        {!project.isArchived
          ? <Button variant="outline" size="sm" onClick={onArchive}><Archive className="h-4 w-4 mr-1" />{t.projects.archive}</Button>
          : <Button variant="destructive" size="sm" onClick={onPurge}><Trash2 className="h-4 w-4 mr-1" />{t.detail.purge}</Button>}
      </div>
    </div>
  )
}
