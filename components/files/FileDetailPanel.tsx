'use client'

import { FileText } from 'lucide-react'
import { formatFileSize } from '@/components/projects/project-utils'
import { formatDate } from '@/components/projects/project-utils'
import type { FileItem } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

function metadataRow(label: string, value: string) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-xs text-zinc-500">{label}</dt>
      <dd className="min-w-0 text-right text-sm text-zinc-200">{value}</dd>
    </div>
  )
}

interface FileDetailPanelProps {
  file: FileItem | null
  t: typeof en
}

export function FileDetailPanel({ file, t }: FileDetailPanelProps) {
  if (!file) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] p-8 text-center">
        <FileText className="h-10 w-10 text-zinc-600" />
        <p className="mt-3 text-sm text-zinc-500">{t.filesPage.noFileSelected}</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/[0.06] bg-[#111113]">
      <div className="border-b border-white/[0.06] p-5">
        <h3 className="text-sm font-semibold text-zinc-200">{t.filesPage.detail}</h3>
        <p className="mt-2 break-all text-sm font-medium text-white">{file.filename}</p>
      </div>
      <dl className="flex-1 divide-y divide-white/[0.06] px-5 py-2">
        {metadataRow(t.filesPage.size, formatFileSize(file.sizeBytes))}
        {metadataRow(t.filesPage.type, file.mimeType || '—')}
        {metadataRow(t.filesPage.storageProvider, file.storageProvider || '—')}
        {metadataRow(t.filesPage.uploader, file.uploader?.name || '—')}
        {metadataRow(t.filesPage.uploadedAt, formatDate(file.createdAt))}
      </dl>
      <div className="border-t border-white/[0.06] p-5">
        <p className="text-xs text-zinc-500">{t.filesPage.storageNote}</p>
        <p className="mt-1.5 break-all font-mono text-xs text-zinc-400">
          {file.filePath || file.storageKey || '—'}
        </p>
      </div>
    </div>
  )
}
