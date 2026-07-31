'use client'
import { ScanPathList } from '@/components/settings/ScanPathList'
import { ScanPathForm } from '@/components/settings/ScanPathForm'
import { ScanTrigger } from '@/components/settings/ScanTrigger'
import { Loading } from '@/components/shared/Loading'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { useScanPaths } from '@/hooks/useScanPaths'
import { useScan } from '@/hooks/useScan'

export default function SettingsPage() {
  const { paths, isLoading, create, update, remove, refetch } = useScanPaths()
  const { isScanning, triggerScan, lastScan } = useScan()

  return (
    <ErrorBoundary>
      <div className="space-y-8 max-w-2xl">
        <h2 className="text-xl font-bold">Settings</h2>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Scan Paths</h3>
          <ScanPathForm onSubmit={async (path) => { await create(path); refetch() }} />
          {isLoading ? <Loading rows={3} /> : (
            <ScanPathList paths={paths}
              onToggle={(id, enabled) => update(id, { enabled })}
              onDelete={(id) => { remove(id); refetch() }}
            />
          )}
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Manual Scan</h3>
          <ScanTrigger onScan={() => triggerScan()} isScanning={isScanning} lastScan={lastScan} />
        </section>
      </div>
    </ErrorBoundary>
  )
}
