'use client'

import { useState } from 'react'
import { Archive, Trash2, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from './Avatar'
import type { ProjectDetailData } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

const ROLES = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']

interface ProjectSettingsProps {
  project: ProjectDetailData
  t: typeof en
  onChanged: () => void
  onArchive: () => Promise<boolean>
  onPurge: () => Promise<boolean>
  onArchived: () => void
  onPurged: () => void
}

export function ProjectSettings({
  project,
  t,
  onChanged,
  onArchive,
  onPurge,
  onArchived,
  onPurged,
}: ProjectSettingsProps) {
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState('MEMBER')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const addMember = async () => {
    if (!userId.trim() || busy) return
    setBusy(true)
    setMessage(null)
    try {
      const res = await fetch('/api/projects/' + project.id + '/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId.trim(), role }),
      })
      const json = (await res.json()) as { success: boolean; error?: { message?: string } | null }
      if (json.success) {
        setMessage({ type: 'ok', text: t.projectPage.memberAdded })
        setUserId('')
        onChanged()
      } else {
        setMessage({ type: 'err', text: json.error?.message || t.projectPage.deleteFailed })
      }
    } catch {
      setMessage({ type: 'err', text: t.projectPage.deleteFailed })
    } finally {
      setBusy(false)
    }
  }

  const removeMember = async (memberUserId: string) => {
    if (busy) return
    setBusy(true)
    setMessage(null)
    try {
      const res = await fetch(
        '/api/projects/' + project.id + '/members?userId=' + encodeURIComponent(memberUserId),
        { method: 'DELETE' }
      )
      const json = (await res.json()) as { success: boolean; error?: { message?: string } | null }
      if (json.success) {
        setMessage({ type: 'ok', text: t.projectPage.memberRemoved })
        onChanged()
      } else {
        setMessage({ type: 'err', text: json.error?.message || t.projectPage.deleteFailed })
      }
    } catch {
      setMessage({ type: 'err', text: t.projectPage.deleteFailed })
    } finally {
      setBusy(false)
    }
  }

  const handleArchive = async () => {
    if (!window.confirm(t.projectPage.archiveConfirm)) return
    const ok = await onArchive()
    if (ok) onArchived()
  }

  const handlePurge = async () => {
    if (!window.confirm(t.projectPage.hardDeleteConfirm)) return
    const ok = await onPurge()
    if (ok) onPurged()
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/[0.06] bg-[#111113] p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-200">{t.projectPage.members}</h3>
        {project.members.length === 0 ? (
          <p className="text-sm text-zinc-500">{t.projectPage.noMembers}</p>
        ) : (
          <ul className="space-y-2">
            {project.members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Avatar name={member.user.name} />
                  <div>
                    <p className="text-sm text-zinc-200">{member.user.name}</p>
                    <p className="text-[11px] uppercase tracking-wide text-zinc-500">{member.role}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void removeMember(member.user.id)}
                  disabled={busy}
                >
                  {t.projectPage.removeMember}
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div className="w-52">
            <label className="mb-1 block text-xs text-zinc-500">{t.projectPage.memberEmail}</label>
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="default-user" />
          </div>
          <div className="w-36">
            <label className="mb-1 block text-xs text-zinc-500">{t.projectPage.memberRole}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-9 w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 text-sm text-white"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <Button size="sm" onClick={() => void addMember()} disabled={busy || !userId.trim()}>
            <UserPlus className="h-4 w-4" /> {t.projectPage.addMember}
          </Button>
        </div>
        {message && (
          <p className={message.type === 'ok' ? 'mt-3 text-xs text-green-400' : 'mt-3 text-xs text-red-400'}>
            {message.text}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-red-500/20 bg-[#111113] p-5">
        <h3 className="text-sm font-semibold text-red-400">{t.projectPage.dangerZone}</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={() => void handleArchive()} disabled={project.isArchived}>
            <Archive className="h-4 w-4" /> {t.projectPage.archiveProject}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => void handlePurge()}>
            <Trash2 className="h-4 w-4" /> {t.projectPage.hardDelete}
          </Button>
        </div>
      </section>
    </div>
  )
}
