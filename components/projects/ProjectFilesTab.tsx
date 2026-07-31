'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate, formatFileSize } from './project-utils'
import type { FileItem } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

interface FilesResponse {
  items: FileItem[]
  total: number
}

interface FilesEnvelope {
  success: boolean
  data?: FilesResponse | null
  error?: { message?: string } | null
}

const fetcher = async (url: string): Promise<FilesResponse> => {
  const res = await fetch(url)
  const json = (await res.json()) as FilesEnvelope
  if (json.success && json.data) return json.data
  throw new Error(json.error?.message || 'Failed to load files')
}

export function ProjectFilesTab({ projectId, t }: { projectId: string; t: typeof en }) {
  const { data, isLoading, error, mutate } = useSWR<FilesResponse>(
    '/api/files?projectId=' + encodeURIComponent(projectId) + '&limit=100',
    fetcher
  )
  const [deleting, setDeleting] = useState<string | null>(null)
  const files = data?.items ?? []

  const remove = async (file: FileItem) => {
    setDeleting(file.id)
    try {
      const res = await fetch('/api/files/' + file.id, { method: 'DELETE' })
      const json = (await res.json()) as { success: boolean; error?: { message?: string } | null }
      if (json.success) await mutate()
    } finally {
      setDeleting(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-red-400">{error instanceof Error ? error.message : String(error)}</p>
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] py-16 text-center">
        <FileText className="h-10 w-10 text-zinc-600" />
        <p className="mt-3 text-sm text-zinc-500">{t.projectPage.noFiles}</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-[#111113]">
      {files.map((file) => (
        <li key={file.id} className="flex items-center gap-3 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-400">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-200">{file.filename}</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {file.mimeType || 'file'} · {formatFileSize(file.sizeBytes)}
              {file.uploader && <> · {t.projectPage.uploader} {file.uploader.name}</>}
              {' · '}
              {formatDate(file.createdAt)}
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => void remove(file)} disabled={deleting === file.id}>
            <Trash2 className="h-4 w-4 text-zinc-500 transition-colors hover:text-red-400" />
          </Button>
        </li>
      ))}
    </ul>
  )
}
