'use client'

import { cn } from '@/lib/utils'
import type { en } from '@/lib/i18n/dictionaries/en'

interface StatusStyle {
  dot: string
  pill: string
  labelKey: keyof typeof en['status']
}

export const STATUS_STYLES: Record<string, StatusStyle> = {
  PLANNING: { dot: 'bg-zinc-400', pill: 'bg-zinc-500/10 text-zinc-300', labelKey: 'planning' },
  IN_PROGRESS: { dot: 'bg-violet-400', pill: 'bg-violet-500/10 text-violet-300', labelKey: 'inProgress' },
  REVIEW: { dot: 'bg-blue-400', pill: 'bg-blue-500/10 text-blue-300', labelKey: 'review' },
  COMPLETED: { dot: 'bg-green-400', pill: 'bg-green-500/10 text-green-300', labelKey: 'completed' },
  DELAYED: { dot: 'bg-amber-400', pill: 'bg-amber-500/10 text-amber-300', labelKey: 'delayed' },
  AT_RISK: { dot: 'bg-red-400', pill: 'bg-red-500/10 text-red-300', labelKey: 'atRisk' },
  TODO: { dot: 'bg-zinc-400', pill: 'bg-zinc-500/10 text-zinc-300', labelKey: 'todo' },
  DONE: { dot: 'bg-green-400', pill: 'bg-green-500/10 text-green-300', labelKey: 'done' },
}

const FALLBACK_STYLE = STATUS_STYLES.PLANNING

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
  t?: typeof en
}

export function StatusBadge({ status, size = 'md', t }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || FALLBACK_STYLE
  const label = t ? t.status[style.labelKey] : status

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs',
        style.pill
      )}
    >
      <span className={cn('size-1.5 rounded-full', style.dot)} />
      {label}
    </span>
  )
}
