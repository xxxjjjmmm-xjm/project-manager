'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ProjectDetail } from '@/lib/types'

export function ProjectForm({ project, open, onOpenChange, onSave }: {
  project: ProjectDetail; open: boolean; onOpenChange: (o: boolean) => void
  onSave: (data: Record<string, unknown>) => Promise<unknown>
}) {
  const [name, setName] = useState(project.name)
  const [desc, setDesc] = useState(project.description)
  const [saving, setSaving] = useState(false)
  const save = async () => { setSaving(true); await onSave({ name, description: desc }); setSaving(false); onOpenChange(false) }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Project</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Name</label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="text-sm font-medium">Description</label><Input value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
