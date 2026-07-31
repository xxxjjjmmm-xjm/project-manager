'use client'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export function ScanTrigger({ onScan, isScanning, lastScan }: {
  onScan: () => void; isScanning: boolean; lastScan: string | null
}) {
  return (
    <div className="flex items-center gap-4">
      <Button onClick={onScan} disabled={isScanning}>
        <RefreshCw className={'h-4 w-4 mr-1' + (isScanning ? ' animate-spin' : '')} />
        {isScanning ? 'Scanning...' : 'Scan Now'}
      </Button>
      {lastScan && <span className="text-xs text-muted-foreground">Last: {new Date(lastScan).toLocaleString()}</span>}
    </div>
  )
}
