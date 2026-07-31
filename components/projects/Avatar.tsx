'use client'

import { cn } from '@/lib/utils'

interface AvatarProps {
  name: string
  className?: string
}

export function Avatar({ name, className }: AvatarProps) {
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?'
  return (
    <span
      className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/40 to-violet-500/40 text-[10px] font-semibold text-white',
        className
      )}
      title={name}
    >
      {initial}
    </span>
  )
}
