'use client'

import { cn } from '@/lib/utils'
import type { TeamMember } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

const ROLE_STYLES: Record<string, string> = {
  OWNER: 'bg-violet-500/10 text-violet-300',
  ADMIN: 'bg-blue-500/10 text-blue-300',
  MEMBER: 'bg-zinc-500/10 text-zinc-300',
  VIEWER: 'bg-white/[0.06] text-zinc-400',
}

function roleLabel(role: string, t: typeof en): string {
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

function initials(name: string): string {
  return (name || '?').trim().charAt(0).toUpperCase() || '?'
}

interface MemberCardProps {
  member: TeamMember
  t: typeof en
}

export function MemberCard({ member, t }: MemberCardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-4 transition-colors hover:bg-[#18181B]">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-semibold text-white">
          {initials(member.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-white">{member.name}</p>
            <span
              className={cn(
                'inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium',
                ROLE_STYLES[member.role] || 'bg-white/[0.06] text-zinc-400'
              )}
            >
              {roleLabel(member.role, t)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-zinc-500">{member.email}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <span className="text-xs text-zinc-500">{t.teamPage.openTasks}</span>
        <span className="text-sm font-semibold tabular-nums text-zinc-200">
          {member.openTasks}
        </span>
      </div>
    </div>
  )
}
