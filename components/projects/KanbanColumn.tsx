'use client'

import { cn } from '@/lib/utils'
import { PriorityBadge } from './PriorityBadge'
import { formatDate } from './project-utils'
import type { TaskItem } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

const COLUMN_ACCENTS: Record<string, string> = {
  TODO: 'bg-zinc-400',
  IN_PROGRESS: 'bg-violet-400',
  REVIEW: 'bg-blue-400',
  DONE: 'bg-green-400',
}

interface KanbanColumnProps {
  title: string
  status: string
  tasks: TaskItem[]
  onDrop: (taskId: string) => void
  onTaskClick?: (task: TaskItem) => void
  t: typeof en
}

export function KanbanColumn({ title, status, tasks, onDrop, onTaskClick, t }: KanbanColumnProps) {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) onDrop(taskId)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDrop={handleDrop}
      className="flex min-h-[240px] min-w-[240px] flex-1 flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full', COLUMN_ACCENTS[status] || 'bg-zinc-400')} />
        <span className="text-sm font-medium text-zinc-200">{title}</span>
        <span className="ml-auto rounded-full bg-white/[0.06] px-2 py-0.5 text-xs tabular-nums text-zinc-400">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/[0.08] py-8 text-xs text-zinc-600">
            {t.projectPage.taskDragHint}
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', task.id)
                e.dataTransfer.effectAllowed = 'move'
              }}
              onClick={() => onTaskClick?.(task)}
              className="cursor-grab rounded-xl border border-white/[0.06] bg-[#111113] p-3 transition hover:border-white/[0.12] hover:bg-[#18181B] active:cursor-grabbing"
            >
              <p className="text-sm font-medium leading-snug text-zinc-100">{task.title}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <PriorityBadge priority={task.priority} t={t} />
                <div className="flex items-center gap-2">
                  {task.dueDate && (
                    <span className="text-[11px] tabular-nums text-zinc-500">
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                  {task.assignee && (
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/40 to-violet-500/40 text-[9px] font-semibold text-white"
                      title={task.assignee.name}
                    >
                      {task.assignee.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
