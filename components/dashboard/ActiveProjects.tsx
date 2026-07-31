import { RecentProjects } from './RecentProjects'
import type { ProjectListItem } from '@/lib/types'

export function ActiveProjects({ projects, title }: {
  projects: ProjectListItem[]
  title: string
}) {
  return <RecentProjects projects={projects} title={title} />
}
