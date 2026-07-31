import { useState, useCallback } from 'react'
import type { ScanRecordItem } from '@/lib/types'

export function useScan() {
  const [isScanning, setIsScanning] = useState(false)
  const [records, setRecords] = useState<ScanRecordItem[]>([])
  const [lastScan, setLastScan] = useState<string | null>(null)

  const triggerScan = useCallback(async (pathId?: string) => {
    setIsScanning(true)
    try {
      const url = pathId ? "/api/plugins/scan/trigger?pathId=" + pathId : "/api/plugins/scan/trigger"
      const res = await fetch(url, { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        setLastScan(new Date().toISOString())
        const recsRes = await fetch("/api/plugins/scan/records?latest=20")
        const recsJson = await recsRes.json()
        if (recsJson.success) setRecords(recsJson.data)
      }
    } finally { setIsScanning(false) }
  }, [])

  return { isScanning, triggerScan, records, lastScan }
}
