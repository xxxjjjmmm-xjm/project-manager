'use client'

import { useRef, useState } from 'react'
import { Search, Upload } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FileCard } from '@/components/files/FileCard'
import { FileDetailPanel } from '@/components/files/FileDetailPanel'
import { useFiles } from '@/hooks/useFiles'
import { useProjects } from '@/hooks/useProjects'
import { useDebounce } from '@/hooks/useDebounce'
import { useI18n } from '@/lib/i18n/context'
import type { FileItem } from '@/lib/types'

export default function FilesPage() {
  const { t, locale } = useI18n()
  const [search, setSearch] = useState('')
  const [projectId, setProjectId] = useState('ALL')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const debouncedSearch = useDebounce(search, 300)
  const { files, total, isLoading, error, deleteFile, retry } = useFiles(debouncedSearch)
  const { projects } = useProjects({ page: 1, limit: 100 })

  const selectedFile = files.find((f) => f.id === selectedId) ?? null

  const handleUpload = async (file: File) => {
    if (!file || uploading) return
    setUploading(true)
    setActionError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      if (projectId !== 'ALL') form.append('projectId', projectId)
      const res = await fetch('/api/files/upload', { method: 'POST', body: form })
      const json = (await res.json()) as {
        success: boolean
        data?: { id?: string } | null
        error?: { message?: string } | null
      }
      if (!json.success || !json.data) {
        throw new Error(json.error?.message || 'Upload failed')
      }
      await retry()
      setSelectedId(json.data.id ?? null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (file: FileItem) => {
    if (!window.confirm(t.filesPage.deleteConfirm)) return
    setActionError(null)
    try {
      await deleteFile(file.id)
      if (selectedId === file.id) setSelectedId(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="flex h-[calc(100vh-6.5rem)] flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">{t.filesPage.title}</h1>
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs tabular-nums text-zinc-400">
            {total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            aria-label={t.filesPage.project}
            className="h-9 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 text-sm text-white outline-none transition-colors focus-visible:ring-1 focus-visible:ring-[#3B82F6]/30"
          >
            <option value="ALL" className="bg-[#09090B] text-white">
              {t.filesPage.allProjects}
            </option>
            {projects.map((project) => (
              <option key={project.id} value={project.id} className="bg-[#09090B] text-white">
                {project.name}
              </option>
            ))}
          </select>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleUpload(file)
            }}
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? t.filesPage.uploading : t.filesPage.upload}
            {!uploading && <Upload className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-6">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.filesPage.searchPlaceholder}
              className="pl-9"
            />
          </div>

          {actionError && <p className="mb-2 text-xs text-red-400">{actionError}</p>}

          {error ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111113] px-6 py-16 text-center">
              <p className="text-sm text-zinc-400">{t.filesPage.loadFailed}</p>
              <Button variant="outline" size="sm" onClick={retry}>
                {t.common.retry}
              </Button>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]"
                    />
                  ))}
                </div>
              ) : files.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/[0.08] py-16 text-center">
                  <p className="text-sm text-zinc-500">{t.filesPage.empty}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      selected={file.id === selectedId}
                      onClick={() => setSelectedId(file.id)}
                      onDelete={(f) => void handleDelete(f)}
                      locale={locale}
                      t={t}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-96 shrink-0">
          <FileDetailPanel file={selectedFile} t={t} />
        </div>
      </div>
    </div>
  )
}
