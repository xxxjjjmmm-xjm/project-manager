import { GitCommit, Search } from 'lucide-react'
import type { GitCommitItem, ScanRecordItem } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

export function ProjectDetailTimeline({ commits, scanRecords, t }: {
  commits: GitCommitItem[]; scanRecords: ScanRecordItem[]; t: typeof en
}) {
  const entries = [
    ...commits.map((c) => ({ type: 'commit' as const, date: c.date, summary: c.message, detail: c.hash.slice(0, 7) + ' by ' + c.author })),
    ...scanRecords.map((s) => ({ type: 'scan' as const, date: s.scannedAt, summary: 'Scan: ' + s.status + ' (' + s.fileCount + ' files)', detail: s.errorMessage || s.scanPath })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 60)
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">{t.detail.noActivity}</p>
  return (<div className="space-y-1">{entries.map((e, i) => (
    <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0">
      <div className="mt-0.5">{e.type === 'commit' ? <GitCommit className="h-4 w-4 text-green-600" /> : <Search className="h-4 w-4 text-blue-600" />}</div>
      <div><p className="text-sm">{e.summary}</p><div className="flex gap-3 text-xs text-muted-foreground"><span>{new Date(e.date).toLocaleString()}</span>{e.detail && <span>{e.detail}</span>}</div></div>
    </div>
  ))}</div>)
}
