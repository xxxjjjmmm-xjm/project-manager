'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import type { TeamMember, TeamRole } from '@/lib/types'

export interface InviteMemberInput {
  email: string
  name?: string
  role?: TeamRole
}

interface TeamEnvelope {
  success: boolean
  data?: TeamMember[] | null
  error?: { message?: string } | null
}

interface InviteEnvelope {
  success: boolean
  data?: TeamMember | null
  error?: { message?: string } | null
}

const fetcher = async (url: string): Promise<TeamMember[]> => {
  const res = await fetch(url)
  const json = (await res.json()) as TeamEnvelope
  if (json.success && json.data) return json.data
  throw new Error(json.error?.message || 'Failed to load team')
}

export function useTeam() {
  const { data, isLoading, error, mutate } = useSWR<TeamMember[]>('/api/team', fetcher)

  const inviteMember = useCallback(
    async (input: InviteMemberInput): Promise<void> => {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const json = (await res.json()) as InviteEnvelope
      if (!json.success || !json.data) {
        const message = json.error?.message || 'Failed to invite member'
        throw new InviteError(message, res.status)
      }
      await mutate()
    },
    [mutate]
  )

  const retry = useCallback(() => {
    void mutate()
  }, [mutate])

  return {
    members: data ?? [],
    isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    inviteMember,
    retry,
  }
}

/** Error thrown by inviteMember so the UI can distinguish a 409 conflict. */
export class InviteError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'InviteError'
    this.status = status
  }
}
