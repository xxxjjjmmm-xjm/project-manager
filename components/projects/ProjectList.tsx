'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProjectCard } from './ProjectCard'
import { cn } from '@/lib/utils'
import type { ProjectSummary } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

const STATUS_FILTERS = [
  'ALL',
  'PLANNING',
  'IN_PROGRESS',
  'REVIEW',
  'COMPLETED',
  'DELAYED',
  'AT_RISK',
] as const

function statusLabel(status: string, t: typeof en): string {
  switch (status) {
    case 'PLANNING':
      return t.status.planning
    case 'IN_PROGRESS':
      return t.status.inProgress
    case 'REVIEW':
      return t.status.review
    case 'COMPLETED':
      return t.status.completed
    case 'DELAYED':
      return t.status.delayed
    case 'AT_RISK':
      return t.status.atRisk
    default:
      return status
  }
}

interface ProjectListProps {
  t: typeof en
  projects: ProjectSummary[]
  selectedId: string | null
  onSelect: (id: string) => void
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  isLoading: boolean
  onCreate: (name: string, description: string) => Promise<boolean>
}

export function ProjectList({
  t,
  projects,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  isLoading,
  onCreate,
}: ProjectListProps) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    setError(null)
    try {
      const ok = await onCreate(name.trim(), description.trim())
      if (ok) {
        setName('')
        setDescription('')
        setCreating(false)
      } else {
        setError(t.projectPage.createFailed)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex w-80 shrink-0 flex-col border-r border-white/[0.06] pr-4">
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.projects.search}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(status)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs transition-colors',
                statusFilter === status
                  ? 'border-[#3B82F6]/50 bg-[#3B82F6]/10 text-[#3B82F6]'
                  : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-200'
              )}
            >
              {status === 'ALL' ? t.projectPage.all : statusLabel(status, t)}
            </button>
          ))}
        </div>
        {!creating ? (
          <Button size="sm" className="w-full" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> {t.projectPage.newProject}
          </Button>
        ) : (
          <div className="space-y-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.projectPage.createName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void submit()
              }}
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.projectPage.createDescription}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <Button size="sm" disabled={saving || !name.trim()} onClick={() => void submit()}>
                {saving ? t.form.saving : t.projectPage.create}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setCreating(false)
                  setError(null)
                }}
              >
                {t.common.cancel}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">{t.projectPage.noProjects}</p>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              selected={project.id === selectedId}
              onClick={() => onSelect(project.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
