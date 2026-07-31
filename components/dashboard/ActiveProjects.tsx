import { RecentProjects } from './RecentProjects'
import type { ProjectListItem } from '@/lib/types'

export function ActiveProjects({ projects }: { projects: ProjectListItem[] }) {
  return <RecentProjects projects={projects} title="Recently Active" />
}
