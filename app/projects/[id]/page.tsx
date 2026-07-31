'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pencil } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { Button } from '@/components/ui/button'
import { ProjectOverviewTab } from '@/components/projects/ProjectOverviewTab'
import { KanbanBoard } from '@/components/projects/KanbanBoard'
import { ProjectFilesTab } from '@/components/projects/ProjectFilesTab'
import { ProjectActivityTab } from '@/components/projects/ProjectActivityTab'
import { ProjectSettings } from '@/components/projects/ProjectSettings'
import { ProjectEditForm } from '@/components/projects/ProjectEditForm'
import { useProject } from '@/hooks/useProject'
import { useTasks } from '@/hooks/useTasks'
import { useI18n } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'overview', labelKey: 'overview' },
  { key: 'kanban', labelKey: 'kanban' },
  { key: 'files', labelKey: 'files' },
  { key: 'activity', labelKey: 'activity' },
  { key: 'settings', labelKey: 'settings' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function ProjectDetailPage() {
  const { t } = useI18n()
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { project, isLoading, update, archive, purge, refetch } = useProject(id)
  const { tasks, moveTask } = useTasks(id)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [editing, setEditing] = useState(false)

  // Open a specific tab from a URL hash (e.g. /projects/[id]#kanban).
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && TABS.some((tab) => tab.key === hash)) {
      setActiveTab(hash as TabKey)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-6 w-32 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-6 w-24 animate-pulse rounded bg-white/[0.06]" />
        </div>
        <div className="h-8 w-1/2 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="h-48 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-400">{t.detail.notFound}</p>
        <Link href="/projects" className="mt-3 inline-block text-sm text-blue-400 hover:underline">
          {t.projects.title}
        </Link>
      </div>
    )
  }

  const handleArchive = async (): Promise<boolean> => {
    try {
      await archive()
      return true
    } catch {
      return false
    }
  }

  const handlePurge = async (): Promise<boolean> => {
    try {
      await purge()
      return true
    } catch {
      return false
    }
  }

  const handleMoveTask = async (taskId: string, status: string) => {
    try {
      await moveTask(taskId, status)
      await refetch()
    } catch {
      // optimistic update already rolled back inside the hook
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/projects"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> {t.projects.title}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
              <span className="truncate">{project.name}</span>
              <StatusBadge status={project.status} size="sm" />
              {project.isArchived && <span className="text-xs text-zinc-500">{t.projects.archived}</span>}
            </h1>
            <div className="mt-2 max-w-md">
              <ProgressBar progress={project.progress} showLabel />
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
            <Pencil className="h-4 w-4" /> {t.projectPage.edit}
          </Button>
        </div>
      </div>

      {editing && (
        <ProjectEditForm
          project={project}
          t={t}
          onSave={async (body) => {
            await update(body)
            await refetch()
            return true
          }}
          onCancel={() => setEditing(false)}
        />
      )}

      <div className="flex gap-1 border-b border-white/[0.06]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'border-[#3B82F6] text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            )}
          >
            {t.projectPage[tab.labelKey]}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'overview' && <ProjectOverviewTab project={project} t={t} />}
        {activeTab === 'kanban' && <KanbanBoard tasks={tasks} onMoveTask={handleMoveTask} t={t} />}
        {activeTab === 'files' && <ProjectFilesTab projectId={id} t={t} />}
        {activeTab === 'activity' && <ProjectActivityTab projectId={id} t={t} />}
        {activeTab === 'settings' && (
          <ProjectSettings
            project={project}
            t={t}
            onChanged={refetch}
            onArchive={handleArchive}
            onPurge={handlePurge}
            onArchived={() => {
              void refetch()
            }}
            onPurged={() => router.push('/projects')}
          />
        )}
      </div>
    </div>
  )
}
