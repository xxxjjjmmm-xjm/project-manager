'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { FileStack, FolderKanban, ListTodo, Search } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { fileIcon } from '@/components/files/FileCard'
import { formatDate, formatFileSize } from '@/components/projects/project-utils'
import { useSearch } from '@/hooks/useSearch'
import { useProjects } from '@/hooks/useProjects'
import { useDebounce } from '@/hooks/useDebounce'
import { useI18n } from '@/lib/i18n/context'
import type { ProjectSummary, SearchFileResult } from '@/lib/types'

export default function SearchPage() {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedQuery = useDebounce(query, 250)
  const { results, isLoading, error } = useSearch(debouncedQuery)
  const { projects } = useProjects({ page: 1, limit: 100 })

  const projectsById = useMemo(() => {
    const map: Record<string, ProjectSummary> = {}
    for (const project of projects) map[project.id] = project
    return map
  }, [projects])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const hasResults =
    results.projects.length > 0 || results.tasks.length > 0 || results.files.length > 0

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-white">{t.searchPage.title}</h1>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
        <input
          ref={inputRef}
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPage.placeholder}
          className="h-12 w-full rounded-xl border border-white/[0.06] bg-white/[0.04] pl-12 pr-14 text-sm text-white shadow-sm transition-colors placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3B82F6]/30"
        />
        <kbd className="absolute right-4 top-1/2 -translate-y-1/2 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
          ⌘K
        </kbd>
      </div>

      {error ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#111113] py-16 text-center">
          <p className="text-sm text-zinc-400">{t.searchPage.loadFailed}</p>
        </div>
      ) : !query.trim() ? (
        <p className="py-16 text-center text-sm text-zinc-500">{t.searchPage.emptyHint}</p>
      ) : isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.04]"
            />
          ))}
        </div>
      ) : !hasResults ? (
        <p className="py-16 text-center text-sm text-zinc-500">{t.searchPage.noResults}</p>
      ) : (
        <div className="space-y-8">
          {results.projects.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-400">
                <FolderKanban className="h-4 w-4" /> {t.searchPage.projects}
                <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] tabular-nums text-zinc-500">
                  {results.projects.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {results.projects.map((project) => {
                  const full = projectsById[project.id]
                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="rounded-2xl border border-white/[0.06] bg-[#111113] p-4 transition-colors hover:bg-[#18181B]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 truncate text-sm font-semibold text-white">
                          {project.name}
                        </p>
                        <StatusBadge status={project.status} size="sm" t={t} />
                      </div>
                      <div className="mt-3">
                        {full ? (
                          <ProgressBar progress={full.progress} size="sm" />
                        ) : project.dueDate ? (
                          <span className="text-xs text-zinc-500">{formatDate(project.dueDate)}</span>
                        ) : null}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {results.tasks.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-400">
                <ListTodo className="h-4 w-4" /> {t.searchPage.tasks}
                <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] tabular-nums text-zinc-500">
                  {results.tasks.length}
                </span>
              </h2>
              <ul className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-[#111113]">
                {results.tasks.map((task) => (
                  <li key={task.id}>
                    <Link
                      href={`/projects/${task.projectId}#kanban`}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-zinc-100">{task.title}</p>
                        {projectsById[task.projectId] && (
                          <span className="mt-0.5 inline-flex items-center rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[11px] text-zinc-400">
                            {projectsById[task.projectId]?.name}
                          </span>
                        )}
                      </div>
                      <StatusBadge status={task.status} size="sm" t={t} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results.files.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-400">
                <FileStack className="h-4 w-4" /> {t.searchPage.files}
                <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] tabular-nums text-zinc-500">
                  {results.files.length}
                </span>
              </h2>
              <ul className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-[#111113]">
                {results.files.map((file: SearchFileResult) => {
                  const Icon = fileIcon(file.mimeType, file.filename)
                  return (
                    <li key={file.id}>
                      <Link
                        href="/files"
                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-400">
                          <Icon className="h-4 w-4" />
                        </span>
                        <p className="min-w-0 flex-1 truncate text-sm text-zinc-100">
                          {file.filename}
                        </p>
                        <span className="shrink-0 text-xs tabular-nums text-zinc-500">
                          {formatFileSize(file.sizeBytes)}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
