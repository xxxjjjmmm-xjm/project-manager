'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import type { TagItem } from '@/lib/types'

export function TagManager({ projectId, currentTags, allTags, onTagAdded, onTagRemoved }: {
  projectId: string; currentTags: { id: string; name: string; color: string }[]
  allTags: TagItem[]; onTagAdded: () => void; onTagRemoved: () => void
}) {
  const [newTag, setNewTag] = useState('')

  const addTag = async () => {
    if (!newTag.trim()) return
    let tag: { id: string } | undefined = allTags.find((t) => t.name.toLowerCase() === newTag.toLowerCase())
    if (!tag) {
      const res = await fetch('/api/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newTag }) })
      const json = await res.json()
      if (!json.success || !json.data) return
      tag = json.data
    }
    if (!tag) return
    await fetch('/api/projects/' + projectId + '/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tagIds: [tag.id] }) })
    setNewTag('')
    onTagAdded()
  }

  const removeTag = async (tagId: string) => {
    await fetch('/api/projects/' + projectId + '/tags?tagId=' + tagId, { method: 'DELETE' })
    onTagRemoved()
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Tags</h4>
      <div className="flex flex-wrap gap-1">
        {currentTags.map((t) => (
          <span key={t.id} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: t.color + '20', color: t.color }}>
            {t.name}<button onClick={() => removeTag(t.id)}><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input placeholder="New tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} className="max-w-[140px] h-8 text-xs" onKeyDown={(e) => e.key === 'Enter' && addTag()} />
        <Button size="sm" variant="outline" onClick={addTag}><Plus className="h-3 w-3" /></Button>
      </div>
    </div>
  )
}
