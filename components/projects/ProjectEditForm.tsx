'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { ProjectDetailData } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

const PROJECT_STATUSES = ['PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'DELAYED', 'AT_RISK']
const PRIORITIES = ['URGENT', 'HIGH', 'MEDIUM', 'LOW']

interface ProjectEditFormProps {
  project: ProjectDetailData
  t: typeof en
  onSave: (body: Record<string, unknown>) => Promise<boolean>
  onCancel: () => void
}

export function ProjectEditForm({ project, t, onSave, onCancel }: ProjectEditFormProps) {
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description)
  const [status, setStatus] = useState(project.status)
  const [priority, setPriority] = useState(project.priority)
  const [progress, setProgress] = useState(String(project.progress))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    setError(null)
    try {
      const clamped = Math.min(100, Math.max(0, Number(progress) || 0))
      const ok = await onSave({
        name: name.trim(),
        description: description.trim(),
        status,
        priority,
        progress: clamped,
      })
      if (ok) onCancel()
    } catch {
      setError(t.projectPage.deleteFailed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-zinc-500">{t.form.name}</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">{t.form.description}</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">{t.projectPage.status}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 text-sm text-white"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">{t.projectPage.priority}</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="h-9 w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 text-sm text-white"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">{t.projectPage.progress}</label>
          <Input
            type="number"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={() => void submit()} disabled={saving || !name.trim()}>
          {saving ? t.form.saving : t.form.save}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          {t.common.cancel}
        </Button>
      </div>
    </div>
  )
}
