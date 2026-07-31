'use client'

import { useMemo, useState } from 'react'
import { TaskFilters } from '@/components/tasks/TaskFilters'
import { TaskList } from '@/components/tasks/TaskList'
import { useTaskList, type CreateTaskInput } from '@/hooks/useTaskList'
import { useProjects } from '@/hooks/useProjects'
import { useI18n } from '@/lib/i18n/context'

export default function TasksPage() {
  const { t } = useI18n()
  const [status, setStatus] = useState('ALL')
  const [priority, setPriority] = useState('ALL')
  const [projectId, setProjectId] = useState('ALL')
  const [myTasks, setMyTasks] = useState(false)

  const { projects } = useProjects({ page: 1, limit: 100 })
  const { tasks, isLoading, error, toggleDone, createTask, retry } = useTaskList({
    status: status === 'ALL' ? undefined : status,
    priority: priority === 'ALL' ? undefined : priority,
    projectId: projectId === 'ALL' ? undefined : projectId,
    myTasks,
  })

  const projectNames = useMemo(() => {
    const map: Record<string, string> = {}
    for (const project of projects) map[project.id] = project.name
    return map
  }, [projects])

  const handleCreate = async (input: CreateTaskInput): Promise<boolean> => {
    try {
      await createTask(input)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="flex h-[calc(100vh-6.5rem)] gap-6">
      <TaskFilters
        t={t}
        status={status}
        onStatusChange={setStatus}
        priority={priority}
        onPriorityChange={setPriority}
        projects={projects}
        projectId={projectId}
        onProjectChange={setProjectId}
        myTasks={myTasks}
        onMyTasksChange={setMyTasks}
        onCreate={handleCreate}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">{t.tasksPage.title}</h1>
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs tabular-nums text-zinc-400">
            {tasks.length}
          </span>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111113] px-6 py-16 text-center">
            <p className="text-sm text-zinc-400">{t.tasksPage.loadFailed}</p>
            <button
              type="button"
              onClick={retry}
              className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
            >
              {t.common.retry}
            </button>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="space-y-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]"
                  />
                ))}
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                projectNames={projectNames}
                onToggleDone={toggleDone}
                t={t}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
