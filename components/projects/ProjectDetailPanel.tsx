'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, FolderKanban } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { Button } from '@/components/ui/button'
import { Avatar } from './Avatar'
import { PriorityBadge } from './PriorityBadge'
import { formatDate } from './project-utils'
import { useProject } from '@/hooks/useProject'
import type { en } from '@/lib/i18n/dictionaries/en'

interface ProjectDetailPanelProps {
  projectId: string | null
  t: typeof en
}

export function ProjectDetailPanel({ projectId, t }: ProjectDetailPanelProps) {
  const { project, isLoading } = useProject(projectId ?? undefined)
  const router = useRouter()

  if (!projectId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] text-center">
        <FolderKanban className="h-12 w-12 text-zinc-600" />
        <h3 className="mt-4 text-base font-semibold text-zinc-300">{t.projectPage.selectProject}</h3>
        <p className="mt-1 text-sm text-zinc-500">{t.projectPage.selectHint}</p>
      </div>
    )
  }

  if (isLoading || !project) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="h-8 w-1/3 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-white/[0.06]" />
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]"
            />
          ))}
        </div>
      </div>
    )
  }

  const members = project.members ?? []
  const owner = project.owner

  return (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto pr-1">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-white">{project.name}</h2>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={project.status} size="sm" />
            {project.isArchived && <span className="text-xs text-zinc-500">{t.projects.archived}</span>}
          </div>
        </div>
        <Button size="sm" onClick={() => router.push('/projects/' + project.id)}>
          {t.projectPage.openDetail} <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-500">
          <span>{t.projectPage.progress}</span>
          <span className="tabular-nums">{project.progress}%</span>
        </div>
        <ProgressBar progress={project.progress} />
      </div>

      {project.description && (
        <p className="text-sm leading-relaxed text-zinc-400">{project.description}</p>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <InfoCell label={t.projectPage.priority} value={<PriorityBadge priority={project.priority} t={t} />} />
        <InfoCell label={t.projectPage.type} value={project.type} />
        <InfoCell label={t.projectPage.status} value={<StatusBadge status={project.status} size="sm" />} />
        <InfoCell label={t.projectPage.startDate} value={formatDate(project.startDate)} />
        <InfoCell label={t.projectPage.dueDate} value={formatDate(project.dueDate)} />
        <InfoCell label={t.projectPage.path} value={project.path} mono />
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-zinc-300">{t.projectPage.members}</h4>
        {members.length === 0 && owner ? (
          <div className="flex items-center gap-2">
            <Avatar name={owner.name} />
            <span className="text-sm text-zinc-400">
              {owner.name} <span className="text-xs text-zinc-600">{t.projectPage.owner}</span>
            </span>
          </div>
        ) : members.length === 0 ? (
          <p className="text-sm text-zinc-500">{t.projectPage.noMembers}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {members.map((member) => (
              <span
                key={member.id}
                className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] py-1 pl-1 pr-2.5 text-xs text-zinc-300"
              >
                <Avatar name={member.user.name} />
                {member.user.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoCell({
  label,
  value,
  mono = false,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <div className={mono ? 'mt-1 truncate font-mono text-sm text-zinc-200' : 'mt-1 text-sm font-medium text-zinc-200'}>
        {value}
      </div>
    </div>
  )
}
