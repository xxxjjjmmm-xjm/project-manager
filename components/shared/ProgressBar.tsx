'use client'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  progress: number
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function ProgressBar({ progress, size = 'md', showLabel = false }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress))

  return (
    <div className="flex w-full items-center gap-2">
      <div
        className={cn(
          'flex-1 overflow-hidden rounded-full bg-white/[0.06]',
          size === 'sm' ? 'h-1.5' : 'h-2'
        )}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="shrink-0 text-xs tabular-nums text-zinc-400">{clamped}%</span>
      )}
    </div>
  )
}
