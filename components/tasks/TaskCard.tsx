'use client'

import { CheckSquare, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PriorityBadge } from '@/components/projects/PriorityBadge'
import { formatDate } from '@/components/projects/project-utils'
import { getDayDiff } from '@/lib/time'
import type { TaskItem } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

interface TaskCardProps {
  task: TaskItem
  projectName?: string
  onToggleDone?: (task: TaskItem) => void
  t: typeof en
}

export function TaskCard({ task, projectName, onToggleDone, t }: TaskCardProps) {
  const isDone = task.status === 'DONE'
  const overdue = !isDone && task.dueDate != null && getDayDiff(task.dueDate) < 0

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-[#111113] p-4 transition hover:border-white/[0.12] hover:bg-[#18181B]">
      <button
        type="button"
        onClick={() => onToggleDone?.(task)}
        aria-label={isDone ? t.status.todo : t.status.done}
        className={cn(
          'mt-0.5 shrink-0 text-zinc-500 transition hover:text-[#3B82F6]',
          isDone && 'text-[#3B82F6]'
        )}
      >
        {isDone ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm font-medium leading-snug text-zinc-100',
            isDone && 'text-zinc-500 line-through'
          )}
        >
          {task.title}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={task.status} size="sm" t={t} />
          <PriorityBadge priority={task.priority} t={t} />
          {projectName && (
            <span className="inline-flex items-center rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[11px] text-zinc-400">
              {projectName}
            </span>
          )}
          {task.dueDate && (
            <span
              className={cn(
                'text-[11px] tabular-nums',
                overdue ? 'font-medium text-red-400' : 'text-zinc-500'
              )}
            >
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
