'use client'

import { StatusBadge } from '@/components/shared/StatusBadge'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { cn } from '@/lib/utils'
import type { ProjectSummary } from '@/lib/types'

interface ProjectCardProps {
  project: ProjectSummary
  onClick: () => void
  selected?: boolean
}

export function ProjectCard({ project, onClick, selected = false }: ProjectCardProps) {
  const members = project.members ?? []

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-2xl border border-white/[0.06] bg-[#111113] p-4 text-left transition-colors hover:bg-[#18181B]',
        selected && 'border-[#3B82F6]/50 bg-[#18181B]'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate text-sm font-semibold text-white">{project.name}</h3>
        <StatusBadge status={project.status} size="sm" />
      </div>
      <div className="mt-3">
        <ProgressBar progress={project.progress} size="sm" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        {members.length > 0 ? (
          <div className="flex items-center">
            <div className="flex -space-x-1.5">
              {members.slice(0, 4).map((member) => (
                <span
                  key={member.id}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-blue-500/40 to-violet-500/40 text-[10px] font-semibold text-white"
                >
                  {member.user.name.charAt(0).toUpperCase()}
                </span>
              ))}
            </div>
            {members.length > 4 && (
              <span className="ml-1.5 text-xs text-zinc-500">+{members.length - 4}</span>
            )}
          </div>
        ) : (
          <span className="text-xs text-zinc-600">{project.type}</span>
        )}
        <span className="text-xs tabular-nums text-zinc-500">{project.progress}%</span>
      </div>
    </button>
  )
}
