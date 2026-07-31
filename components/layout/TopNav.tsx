'use client'
import { Clock } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

interface TopNavProps { lastScannedAt?: string | null }

export function TopNav({ lastScannedAt }: TopNavProps) {
  const { t } = useI18n()
  const formatted = lastScannedAt ? new Date(lastScannedAt).toLocaleString() : t.settings.never
  return (
    <header className="h-12 border-b flex items-center justify-between px-6 bg-card">
      <div />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{t.topNav.lastScan} {formatted}</span>
      </div>
    </header>
  )
}
