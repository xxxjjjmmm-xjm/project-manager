import Link from 'next/link'
import { Badge } from '@/components/shared/Badge'
import type { ProjectListItem } from '@/lib/types'

export function RecentProjects({ projects, title }: {
  projects: ProjectListItem[]
  title: string
}) {
  if (!projects || projects.length === 0) {
    return <p className="text-sm text-muted-foreground">No projects yet</p>
  }
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <ul className="space-y-2">
        {projects.map((p) => (
          <li key={p.id}>
            <Link href={"/projects/" + p.id} className="flex items-center gap-2 text-sm hover:underline">
              <span className="font-medium truncate">{p.name}</span>
              <Badge variant="type">{p.type}</Badge>
              <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                {p.lastCommitAt ? new Date(p.lastCommitAt).toLocaleDateString() : ''}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
