'use client'
import { ScanPathList } from '@/components/settings/ScanPathList'
import { ScanPathForm } from '@/components/settings/ScanPathForm'
import { ScanTrigger } from '@/components/settings/ScanTrigger'
import { Loading } from '@/components/shared/Loading'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { useScanPaths } from '@/hooks/useScanPaths'
import { useScan } from '@/hooks/useScan'
import { useI18n } from '@/lib/i18n/context'

export default function SettingsPage() {
  const { t } = useI18n()
  const { paths, isLoading, create, update, remove, refetch } = useScanPaths()
  const { isScanning, triggerScan, lastScan } = useScan()

  return (
    <ErrorBoundary>
      <div className="space-y-8 max-w-2xl">
        <h2 className="text-xl font-bold">{t.settings.title}</h2>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">{t.settings.scanPaths}</h3>
          <ScanPathForm onSubmit={async (path) => { await create(path); refetch() }} t={t} />
          {isLoading ? <Loading rows={3} /> : (
            <ScanPathList paths={paths}
              onToggle={(id, enabled) => update(id, { enabled })}
              onDelete={(id) => { remove(id); refetch() }}
              t={t}
            />
          )}
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">{t.settings.manualScan}</h3>
          <ScanTrigger onScan={() => triggerScan()} isScanning={isScanning} lastScan={lastScan} t={t} />
        </section>
      </div>
    </ErrorBoundary>
  )
}
