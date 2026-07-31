'use client'

import { TaskCard } from './TaskCard'
import type { TaskItem } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

interface TaskListProps {
  tasks: TaskItem[]
  projectNames: Record<string, string>
  onToggleDone?: (task: TaskItem) => void
  t: typeof en
}

export function TaskList({ tasks, projectNames, onToggleDone, t }: TaskListProps) {
  const sorted = [...tasks].sort(
    (a, b) =>
      a.position - b.position ||
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.08] py-16 text-center text-sm text-zinc-500">
        {t.tasksPage.noTasks}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sorted.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          projectName={projectNames[task.projectId]}
          onToggleDone={onToggleDone}
          t={t}
        />
      ))}
    </div>
  )
}
