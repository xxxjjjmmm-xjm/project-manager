'use client'

import {
  File,
  FileArchive,
  FileCode,
  FileText,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/components/projects/project-utils'
import { relativeTime } from '@/lib/time'
import type { FileItem } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

export function fileIcon(mimeType: string, filename: string) {
  if (mimeType.startsWith('image/')) return ImageIcon
  if (mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) return FileText
  if (
    mimeType.includes('zip') ||
    mimeType.includes('archive') ||
    /\.(zip|rar|7z|tar|gz)$/i.test(filename)
  ) {
    return FileArchive
  }
  if (
    mimeType.startsWith('text/') ||
    /\.(ts|tsx|js|jsx|json|py|css|html|md|yml|yaml|sh)$/i.test(filename)
  ) {
    return FileCode
  }
  return File
}

interface FileCardProps {
  file: FileItem
  selected?: boolean
  onClick: () => void
  onDelete: (file: FileItem) => void
  locale: string
  t: typeof en
}

export function FileCard({
  file,
  selected = false,
  onClick,
  onDelete,
  locale,
  t,
}: FileCardProps) {
  const Icon = fileIcon(file.mimeType || '', file.filename)

  return (
    <div
      className={cn(
        'group relative rounded-2xl border border-white/[0.06] bg-[#111113] transition-colors hover:bg-[#18181B]',
        selected && 'border-[#3B82F6]/50 bg-[#18181B]'
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-400">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 pr-8">
          <p className="truncate text-sm font-medium text-zinc-100">{file.filename}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {formatFileSize(file.sizeBytes)} · {relativeTime(file.createdAt, locale)}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onDelete(file)}
        aria-label={t.filesPage.delete}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-white/[0.06] hover:text-red-400 focus-visible:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
