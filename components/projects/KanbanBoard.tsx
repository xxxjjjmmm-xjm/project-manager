'use client'

import { KanbanColumn } from './KanbanColumn'
import type { TaskItem } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

const COLUMNS = [
  { status: 'TODO', titleKey: 'todo' as const },
  { status: 'IN_PROGRESS', titleKey: 'inProgress' as const },
  { status: 'REVIEW', titleKey: 'review' as const },
  { status: 'DONE', titleKey: 'done' as const },
]

interface KanbanBoardProps {
  tasks: TaskItem[]
  onMoveTask: (taskId: string, status: string) => void
  t: typeof en
}

export function KanbanBoard({ tasks, onMoveTask, t }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {COLUMNS.map((col) => (
        <KanbanColumn
          key={col.status}
          title={t.status[col.titleKey]}
          status={col.status}
          tasks={tasks.filter((task) => task.status === col.status)}
          onDrop={(taskId) => onMoveTask(taskId, col.status)}
          t={t}
        />
      ))}
    </div>
  )
}
