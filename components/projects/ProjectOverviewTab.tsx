'use client'

import { StatusBadge } from '@/components/shared/StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { Avatar } from './Avatar'
import { formatDate, parseTechStack } from './project-utils'
import type { ProjectDetailData } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

export function ProjectOverviewTab({ project, t }: { project: ProjectDetailData; t: typeof en }) {
  const tags = project.tags ?? []
  const members = project.members ?? []
  const techStack = parseTechStack(project.techStack)
  const recentTasks = project.tasks ?? []

  return (
    <div className="space-y-6">
      {project.description && (
        <p className="text-sm leading-relaxed text-zinc-400">{project.description}</p>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Info label={t.projectPage.status} value={<StatusBadge status={project.status} size="sm" />} />
        <Info label={t.projectPage.priority} value={<PriorityBadge priority={project.priority} t={t} />} />
        <Info label={t.projectPage.type} value={project.type} />
        <Info label={t.projectPage.progress} value={`${project.progress}%`} />
        <Info label={t.projectPage.startDate} value={formatDate(project.startDate)} />
        <Info label={t.projectPage.dueDate} value={formatDate(project.dueDate)} />
        <Info label={t.projectPage.path} value={project.path} mono />
        <Info label={t.projectPage.owner} value={project.owner ? project.owner.name : '—'} />
      </div>

      {techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-0.5 text-xs text-zinc-400"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {members.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-zinc-300">{t.projectPage.members}</h4>
          <div className="flex flex-wrap gap-2">
            {members.map((member) => (
              <span
                key={member.id}
                className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] py-1 pl-1 pr-2.5 text-xs text-zinc-300"
              >
                <Avatar name={member.user.name} />
                {member.user.name}
                <span className="text-[10px] uppercase tracking-wide text-zinc-600">{member.role}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-zinc-300">{t.tags.title}</h4>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((link) => (
              <span
                key={link.id}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ backgroundColor: link.tag.color + '20', color: link.tag.color }}
              >
                {link.tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="mb-3 text-sm font-semibold text-zinc-300">{t.projectPage.recentTasks}</h4>
        {recentTasks.length === 0 ? (
          <p className="text-sm text-zinc-500">{t.projectPage.noTasks}</p>
        ) : (
          <ul className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-[#111113]">
            {recentTasks.slice(0, 5).map((task) => (
              <li key={task.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-200">{task.title}</p>
                  {task.assignee && <p className="mt-0.5 text-xs text-zinc-500">{task.assignee.name}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={task.status} size="sm" />
                  {task.dueDate && <span className="text-xs tabular-nums text-zinc-500">{formatDate(task.dueDate)}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Info({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <div className={mono ? 'mt-1 truncate font-mono text-sm text-zinc-200' : 'mt-1 text-sm font-medium text-zinc-200'}>
        {value}
      </div>
    </div>
  )
}
