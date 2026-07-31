import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import type { TagItem } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

export function TagManager({ projectId, currentTags, allTags, onTagAdded, onTagRemoved, t }: {
  projectId: string; currentTags: { id: string; name: string; color: string }[]
  allTags: TagItem[]; onTagAdded: () => void; onTagRemoved: () => void; t: typeof en
}) {
  const [newTag, setNewTag] = useState("")
  const tg = t.tags
  const addTag = async () => {
    if (!newTag.trim()) return
    let tag: { id: string } | undefined = allTags.find((x) => x.name.toLowerCase() === newTag.toLowerCase())
    if (!tag) {
      const res = await fetch("/api/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newTag }) })
      const js = await res.json(); if (!js.success || !js.data) return; tag = js.data
    }
    if (!tag) return
    await fetch("/api/projects/" + projectId + "/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tagIds: [tag.id] }) })
    setNewTag(""); onTagAdded()
  }
  return (<div className="space-y-3"><h4 className="text-sm font-semibold">{tg.title}</h4>
    <div className="flex flex-wrap gap-1">{currentTags.map((x) => <span key={x.id} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: x.color + "20", color: x.color }}>{x.name}<button onClick={() => onTagRemoved()}><X className="h-3 w-3" /></button></span>)}</div>
    <div className="flex gap-2"><Input placeholder={tg.newTag} value={newTag} onChange={(e) => setNewTag(e.target.value)} className="max-w-[140px] h-8 text-xs" onKeyDown={(e) => e.key === "Enter" && addTag()} /><Button size="sm" variant="outline" onClick={addTag}><Plus className="h-3 w-3" /></Button></div>
  </div>)
}
