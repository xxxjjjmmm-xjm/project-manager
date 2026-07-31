'use client'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import type { en } from '@/lib/i18n/dictionaries/en'

export function ScanTrigger({ onScan, isScanning, lastScan, t }: {
  onScan: () => void; isScanning: boolean; lastScan: string | null; t: typeof en
}) {
  const st = t.settings
  return <div className="flex items-center gap-4"><Button onClick={onScan} disabled={isScanning}><RefreshCw className={'h-4 w-4 mr-1' + (isScanning ? ' animate-spin' : '')} />{isScanning ? st.scanning : st.scanNow}</Button>{lastScan && <span className="text-xs text-muted-foreground">{st.lastScan} {new Date(lastScan).toLocaleString()}</span>}</div>
}
