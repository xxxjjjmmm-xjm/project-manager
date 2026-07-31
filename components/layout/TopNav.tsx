'use client'

import { Clock } from 'lucide-react'

interface TopNavProps {
  lastScannedAt?: string | null
}

export function TopNav({ lastScannedAt }: TopNavProps) {
  const formatted = lastScannedAt
    ? new Date(lastScannedAt).toLocaleString()
    : 'Never'

  return (
    <header className="h-12 border-b flex items-center justify-between px-6 bg-card">
      <div />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Last scan: {formatted}</span>
      </div>
    </header>
  )
}
