'use client'
import Link from 'next/link'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/ui/button'
import type { ProjectListItem } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

export function ProjectListTable({ projects, onArchive, t }: {
  projects: ProjectListItem[]; onArchive: (id: string) => void; t: typeof en
}) {
  const tp = t.projects
  if (projects.length === 0) return <p className="text-sm text-muted-foreground py-4">{tp.noProjects}</p>
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead><tr className="bg-muted/50 border-b">
          <th className="text-left p-3 font-medium">{tp.name}</th><th className="text-left p-3 font-medium">{tp.type}</th>
          <th className="text-left p-3 font-medium">{tp.techStack}</th><th className="text-left p-3 font-medium">{tp.lastCommit}</th>
          <th className="text-left p-3 font-medium">{tp.tags}</th><th className="text-right p-3 font-medium">{tp.actions}</th>
        </tr></thead>
        <tbody>{projects.map((p) => (
          <tr key={p.id} className="border-b hover:bg-muted/30">
            <td className="p-3"><Link href={"/projects/" + p.id} className="font-medium hover:underline">{p.name}</Link>
              {p.isArchived && <span className="text-xs text-muted-foreground ml-2">({tp.archived})</span>}</td>
            <td className="p-3"><Badge variant="type">{p.type}</Badge></td>
            <td className="p-3"><div className="flex flex-wrap gap-1">
              {p.techStack.slice(0, 4).map((s) => <Badge key={s} variant="tech">{s}</Badge>)}
              {p.techStack.length > 4 && <span className="text-xs text-muted-foreground">+{p.techStack.length - 4}</span>}
            </div></td>
            <td className="p-3 text-muted-foreground">{p.lastCommitAt ? new Date(p.lastCommitAt).toLocaleDateString() : 'N/A'}</td>
            <td className="p-3"><div className="flex flex-wrap gap-1">
              {p.tags.map((tg) => <span key={tg.id} className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: tg.color + '20', color: tg.color }}>{tg.name}</span>)}
            </div></td>
            <td className="p-3 text-right">{!p.isArchived && <Button variant="ghost" size="sm" onClick={() => onArchive(p.id)}>{tp.archive}</Button>}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}
