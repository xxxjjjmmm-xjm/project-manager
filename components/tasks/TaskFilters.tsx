'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { CreateTaskInput } from '@/hooks/useTaskList'
import type { ProjectSummary } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

const STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const
const PRIORITIES = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const

const STATUS_LABEL_KEY: Record<string, keyof typeof en['status']> = {
  TODO: 'todo',
  IN_PROGRESS: 'inProgress',
  REVIEW: 'review',
  DONE: 'done',
}

const PRIORITY_LABEL_KEY: Record<string, keyof typeof en['priority']> = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

const SELECT_CLASS =
  'w-full rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/30 [&>option]:bg-[#111113]'

interface ChipProps {
  active: boolean
  label: string
  onClick: () => void
}

function Chip({ active, label, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-2.5 py-1 text-xs transition-colors',
        active
          ? 'bg-[#3B82F6] text-white'
          : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200'
      )}
    >
      {label}
    </button>
  )
}

interface TaskFiltersProps {
  t: typeof en
  status: string
  onStatusChange: (value: string) => void
  priority: string
  onPriorityChange: (value: string) => void
  projects: ProjectSummary[]
  projectId: string
  onProjectChange: (value: string) => void
  myTasks: boolean
  onMyTasksChange: (value: boolean) => void
  onCreate?: (input: CreateTaskInput) => Promise<boolean>
}

export function TaskFilters({
  t,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  projects,
  projectId,
  onProjectChange,
  myTasks,
  onMyTasksChange,
  onCreate,
}: TaskFiltersProps) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [formProjectId, setFormProjectId] = useState('')
  const [formStatus, setFormStatus] = useState('TODO')
  const [formPriority, setFormPriority] = useState('MEDIUM')
  const [formDueDate, setFormDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!formProjectId && projects.length > 0) {
      setFormProjectId(projects[0].id)
    }
  }, [projects, formProjectId])

  const submit = async () => {
    if (!title.trim() || !formProjectId || saving || !onCreate) return
    setSaving(true)
    setError(null)
    try {
      const ok = await onCreate({
        projectId: formProjectId,
        title: title.trim(),
        status: formStatus,
        priority: formPriority,
        dueDate: formDueDate || undefined,
      })
      if (ok) {
        setTitle('')
        setFormDueDate('')
        setShowForm(false)
      } else {
        setError(t.tasksPage.createFailed)
      }
    } catch {
      setError(t.tasksPage.createFailed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <aside className="w-64 shrink-0 space-y-5 rounded-2xl border border-white/[0.06] bg-[#111113] p-4">
      <h2 className="text-sm font-semibold text-zinc-200">{t.tasksPage.title}</h2>

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t.tasksPage.status}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <Chip
            active={status === 'ALL'}
            label={t.tasksPage.all}
            onClick={() => onStatusChange('ALL')}
          />
          {STATUSES.map((s) => (
            <Chip
              key={s}
              active={status === s}
              label={t.status[STATUS_LABEL_KEY[s]]}
              onClick={() => onStatusChange(s)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t.tasksPage.priority}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <Chip
            active={priority === 'ALL'}
            label={t.tasksPage.all}
            onClick={() => onPriorityChange('ALL')}
          />
          {PRIORITIES.map((p) => (
            <Chip
              key={p}
              active={priority === p}
              label={t.priority[PRIORITY_LABEL_KEY[p]]}
              onClick={() => onPriorityChange(p)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t.tasksPage.project}
        </h3>
        <select
          value={projectId}
          onChange={(e) => onProjectChange(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="ALL">{t.tasksPage.allProjects}</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
        <span className="text-sm text-zinc-300">{t.tasksPage.myTasks}</span>
        <button
          type="button"
          role="switch"
          aria-checked={myTasks}
          onClick={() => onMyTasksChange(!myTasks)}
          className={cn(
            'relative h-5 w-9 rounded-full transition-colors',
            myTasks ? 'bg-[#3B82F6]' : 'bg-white/[0.1]'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 size-4 rounded-full bg-white transition-all',
              myTasks ? 'left-[18px]' : 'left-0.5'
            )}
          />
        </button>
      </div>

      <div className="border-t border-white/[0.06] pt-4">
        {!showForm ? (
          <Button size="sm" className="w-full" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> {t.tasksPage.newTask}
          </Button>
        ) : (
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault()
              void submit()
            }}
          >
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.tasksPage.titlePlaceholder}
            />
            {projects.length === 0 ? (
              <p className="text-xs text-zinc-500">{t.tasksPage.noProjects}</p>
            ) : (
              <select
                value={formProjectId}
                onChange={(e) => setFormProjectId(e.target.value)}
                className={SELECT_CLASS}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
            <div className="flex gap-2">
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className={SELECT_CLASS}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t.status[STATUS_LABEL_KEY[s]]}
                  </option>
                ))}
              </select>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value)}
                className={SELECT_CLASS}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {t.priority[PRIORITY_LABEL_KEY[p]]}
                  </option>
                ))}
              </select>
            </div>
            <Input
              type="date"
              value={formDueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
              className="[&::-webkit-calendar-picker-indicator]:invert"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={saving || !title.trim() || !formProjectId}
                onClick={() => void submit()}
              >
                {saving ? t.form.saving : t.tasksPage.create}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowForm(false)
                  setError(null)
                }}
              >
                {t.common.cancel}
              </Button>
            </div>
          </form>
        )}
      </div>
    </aside>
  )
}
