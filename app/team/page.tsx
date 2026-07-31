'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MemberCard } from '@/components/team/MemberCard'
import { InviteMemberDialog } from '@/components/team/InviteMemberDialog'
import { useTeam } from '@/hooks/useTeam'
import { useI18n } from '@/lib/i18n/context'

export default function TeamPage() {
  const { t } = useI18n()
  const { members, isLoading, error, inviteMember, retry } = useTeam()
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">{t.teamPage.title}</h1>
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs tabular-nums text-zinc-400">
            {members.length}
          </span>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-4 w-4" /> {t.teamPage.invite}
        </Button>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111113] px-6 py-16 text-center">
          <p className="text-sm text-zinc-400">{t.teamPage.loadFailed}</p>
          <Button variant="outline" size="sm" onClick={retry}>
            {t.common.retry}
          </Button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]"
            />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] py-16 text-center">
          <p className="text-sm text-zinc-500">{t.teamPage.noMembers}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} t={t} />
          ))}
        </div>
      )}

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={inviteMember}
        t={t}
      />
    </div>
  )
}
