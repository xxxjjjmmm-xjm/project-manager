'use client'
import Link from 'next/link'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/ui/button'
import type { ProjectListItem } from '@/lib/types'

interface Props { projects: ProjectListItem[]; onArchive: (id: string) => void }

export function ProjectListTable({ projects, onArchive }: Props) {
  if (projects.length === 0) return <p className="text-sm text-muted-foreground py-4">No projects found</p>
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead><tr className="bg-muted/50 border-b">
          <th className="text-left p-3 font-medium">Name</th><th className="text-left p-3 font-medium">Type</th>
          <th className="text-left p-3 font-medium">Tech Stack</th><th className="text-left p-3 font-medium">Last Commit</th>
          <th className="text-left p-3 font-medium">Tags</th><th className="text-right p-3 font-medium">Actions</th>
        </tr></thead>
        <tbody>{projects.map((p) => (
          <tr key={p.id} className="border-b hover:bg-muted/30">
            <td className="p-3"><Link href={"/projects/" + p.id} className="font-medium hover:underline">{p.name}</Link></td>
            <td className="p-3"><Badge variant="type">{p.type}</Badge></td>
            <td className="p-3"><div className="flex flex-wrap gap-1">
              {p.techStack.slice(0, 4).map((t) => <Badge key={t} variant="tech">{t}</Badge>)}
              {p.techStack.length > 4 && <span className="text-xs text-muted-foreground">+{p.techStack.length - 4}</span>}
            </div></td>
            <td className="p-3 text-muted-foreground">{p.lastCommitAt ? new Date(p.lastCommitAt).toLocaleDateString() : 'N/A'}</td>
            <td className="p-3"><div className="flex flex-wrap gap-1">
              {p.tags.map((t) => <span key={t.id} className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: t.color + '20', color: t.color }}>{t.name}</span>)}
            </div></td>
            <td className="p-3 text-right">{!p.isArchived && <Button variant="ghost" size="sm" onClick={() => onArchive(p.id)}>Archive</Button>}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}
