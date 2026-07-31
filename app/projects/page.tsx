'use client'
import { useState } from 'react'
import { ProjectListTable } from '@/components/projects/ProjectListTable'
import { ProjectFilters } from '@/components/projects/ProjectFilters'
import { Loading } from '@/components/shared/Loading'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { Button } from '@/components/ui/button'
import { useProjects } from '@/hooks/useProjects'
import { useTags } from '@/hooks/useTags'
import { useI18n } from '@/lib/i18n/context'
import type { ProjectType } from '@/lib/types'

export default function ProjectsPage() {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showArchived, setShowArchived] = useState(false)
  const [page, setPage] = useState(1)

  const { projects, pagination, isLoading, refetch } = useProjects({
    search, type: typeFilter === 'all' ? undefined : typeFilter as ProjectType,
    isArchived: showArchived ? true : undefined, page, limit: 20,
  })
  const { tags } = useTags()

  const handleArchive = async (id: string) => {
    await fetch('/api/projects/' + id, { method: 'DELETE' })
    refetch()
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{t.projects.title}</h2>
        <ProjectFilters
          t={t} search={search} onSearchChange={(v) => { setSearch(v); setPage(1) }}
          typeFilter={typeFilter} onTypeChange={(v) => { setTypeFilter(v); setPage(1) }}
          showArchived={showArchived} onArchivedToggle={() => { setShowArchived(!showArchived); setPage(1) }}
          tags={tags}
        />
        {isLoading ? <Loading rows={10} /> : <ProjectListTable t={t} projects={projects} onArchive={handleArchive} />}
        {pagination.totalPages > 1 && (
          <div className="flex items-center gap-2 justify-center">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t.projects.prev}</Button>
            <span className="text-sm text-muted-foreground">{t.projects.page} {page} {t.projects.of} {pagination.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>{t.projects.next}</Button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
