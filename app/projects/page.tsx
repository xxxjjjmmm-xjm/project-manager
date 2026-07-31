'use client'

import { useState } from 'react'
import { ProjectList } from '@/components/projects/ProjectList'
import { ProjectDetailPanel } from '@/components/projects/ProjectDetailPanel'
import { useProjects } from '@/hooks/useProjects'
import { useDebounce } from '@/hooks/useDebounce'
import { useI18n } from '@/lib/i18n/context'

export default function ProjectsPage() {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 300)
  const { projects, isLoading, refetch } = useProjects({
    search: debouncedSearch,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    page: 1,
    limit: 100,
  })

  const handleCreate = async (name: string, description: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      const json = (await res.json()) as {
        success: boolean
        data?: { id?: string } | null
        error?: { message?: string } | null
      }
      if (json.success) {
        await refetch()
        setSelectedId(json.data?.id ?? null)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  return (
    <div className="flex h-[calc(100vh-6.5rem)] gap-6">
      <ProjectList
        t={t}
        projects={projects}
        selectedId={selectedId}
        onSelect={setSelectedId}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        isLoading={isLoading}
        onCreate={handleCreate}
      />
      <ProjectDetailPanel projectId={selectedId} t={t} />
    </div>
  )
}
