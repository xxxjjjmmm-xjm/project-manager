'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProjectDetailHeader } from '@/components/projects/ProjectDetailHeader'
import { ProjectDetailOverview } from '@/components/projects/ProjectDetailOverview'
import { ProjectDetailTimeline } from '@/components/projects/ProjectDetailTimeline'
import { ProjectDetailClaude } from '@/components/projects/ProjectDetailClaude'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { TagManager } from '@/components/projects/TagManager'
import { Loading } from '@/components/shared/Loading'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProject } from '@/hooks/useProject'
import { useTags } from '@/hooks/useTags'
import type { GitCommitItem } from '@/lib/types'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { project, isLoading, update, archive, purge, refetch } = useProject(id)
  const { tags } = useTags()
  const [formOpen, setFormOpen] = useState(false)
  const [readme, setReadme] = useState<string | null>(null)
  const [commits, setCommits] = useState<GitCommitItem[]>([])

  useEffect(() => {
    if (!project?.id) return
    fetch('/api/projects/' + project.id + '/readme').then((r) => r.json()).then((j) => { if (j.success) setReadme(j.data.content) })
    fetch('/api/projects/' + project.id + '/git-commits').then((r) => r.json()).then((j) => { if (j.success) setCommits(j.data) })
  }, [project?.id])

  if (isLoading) return <Loading rows={8} />
  if (!project) return <div className="text-red-500 p-6">Project not found</div>

  return (
    <ErrorBoundary>
      <ProjectDetailHeader project={project}
        onArchive={async () => { await archive(); refetch() }}
        onPurge={async () => { await purge(); router.push('/projects') }}
      />
      <div className="flex gap-6">
        <div className="flex-1">
          <Tabs defaultValue="overview">
            <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger><TabsTrigger value="claude">CLAUDE.md</TabsTrigger></TabsList>
            <TabsContent value="overview" className="mt-4"><ProjectDetailOverview project={project} readme={readme} /></TabsContent>
            <TabsContent value="activity" className="mt-4"><ProjectDetailTimeline commits={commits} scanRecords={project.scanRecords} /></TabsContent>
            <TabsContent value="claude" className="mt-4"><ProjectDetailClaude projectId={project.id} /></TabsContent>
          </Tabs>
        </div>
        <aside className="w-48 shrink-0">
          <TagManager projectId={project.id} currentTags={project.tags} allTags={tags} onTagAdded={refetch} onTagRemoved={refetch} />
          <button onClick={() => setFormOpen(true)} className="text-sm text-blue-600 hover:underline mt-4 block">Edit details</button>
        </aside>
      </div>
      <ProjectForm project={project} open={formOpen} onOpenChange={setFormOpen} onSave={async (data) => { await update(data); refetch() }} />
    </ErrorBoundary>
  )
}
