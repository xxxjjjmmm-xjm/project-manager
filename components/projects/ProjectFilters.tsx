'use client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { TagItem } from '@/lib/types'

interface Props {
  search: string; onSearchChange: (v: string) => void
  typeFilter: string; onTypeChange: (v: string) => void
  showArchived: boolean; onArchivedToggle: () => void
  tags: TagItem[]
}

const TYPES = ['all', 'web', 'cli', 'library', 'mobile', 'desktop', 'script', 'other']

export function ProjectFilters(p: Props) {
  return (
    <div className="space-y-3 mb-4">
      <div className="flex gap-3">
        <Input placeholder="Search projects..." value={p.search} onChange={(e) => p.onSearchChange(e.target.value)} className="max-w-sm" />
        <select value={p.typeFilter} onChange={(e) => p.onTypeChange(e.target.value)} className="border rounded-md px-3 py-2 text-sm bg-background">
          {TYPES.map((t) => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
        </select>
        <Button variant={p.showArchived ? 'secondary' : 'outline'} size="sm" onClick={p.onArchivedToggle}>
          {p.showArchived ? 'Hide Archived' : 'Show Archived'}
        </Button>
      </div>
    </div>
  )
}
