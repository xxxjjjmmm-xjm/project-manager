'use client'

import { cn } from '@/lib/utils'
import { priorityLabel } from './project-utils'
import type { en } from '@/lib/i18n/dictionaries/en'

const PRIORITY_STYLES: Record<string, string> = {
  URGENT: 'bg-red-500/10 text-red-400',
  HIGH: 'bg-orange-500/10 text-orange-400',
  MEDIUM: 'bg-blue-500/10 text-blue-300',
  LOW: 'bg-zinc-500/10 text-zinc-400',
}

export function PriorityBadge({ priority, t }: { priority: string; t: typeof en }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium',
        PRIORITY_STYLES[priority] || 'bg-white/[0.06] text-zinc-400'
      )}
    >
      {priorityLabel(priority, t)}
    </span>
  )
}
