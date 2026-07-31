'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { InviteError, type InviteMemberInput } from '@/hooks/useTeam'
import type { TeamRole } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

const ROLES: TeamRole[] = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']

function roleOptionLabel(role: string, t: typeof en): string {
  switch (role) {
    case 'OWNER':
      return t.teamPage.roleOwner
    case 'ADMIN':
      return t.teamPage.roleAdmin
    case 'MEMBER':
      return t.teamPage.roleMember
    case 'VIEWER':
      return t.teamPage.roleViewer
    default:
      return role
  }
}

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (input: InviteMemberInput) => Promise<void>
  t: typeof en
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  onInvite,
  t,
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<string>('MEMBER')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    if (saving) return
    setEmail('')
    setName('')
    setRole('MEMBER')
    setError(null)
    onOpenChange(false)
  }

  const submit = async () => {
    const trimmed = email.trim()
    if (!trimmed || saving) return
    setSaving(true)
    setError(null)
    try {
      await onInvite({
        email: trimmed,
        name: name.trim() || undefined,
        role: role as TeamRole,
      })
      close()
    } catch (err) {
      if (err instanceof InviteError && err.status === 409) {
        setError(t.teamPage.alreadyMember)
      } else {
        setError(err instanceof Error ? err.message : t.teamPage.inviteFailed)
      }
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-[420px] max-w-full rounded-2xl border border-white/[0.06] bg-[#18181B] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t.teamPage.inviteTitle}</h2>
          <button
            type="button"
            onClick={close}
            aria-label="close"
            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">{t.teamPage.email}</label>
            <Input
              autoFocus
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.teamPage.emailPlaceholder}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void submit()
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">{t.teamPage.name}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.teamPage.name}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">{t.teamPage.role}</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {roleOptionLabel(r, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={close} disabled={saving}>
              {t.teamPage.cancel}
            </Button>
            <Button onClick={() => void submit()} disabled={saving || !email.trim()}>
              {saving ? t.teamPage.inviting : t.teamPage.inviteBtn}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
