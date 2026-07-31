import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ProjectDetail } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

export function ProjectForm({ project, open, onOpenChange, onSave, t }: {
  project: ProjectDetail; open: boolean; onOpenChange: (o: boolean) => void
  onSave: (data: Record<string, unknown>) => Promise<unknown>; t: typeof en
}) {
  const [name, setName] = useState(project.name)
  const [desc, setDesc] = useState(project.description)
  const [saving, setSaving] = useState(false)
  const fm = t.form
  return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent>
    <DialogHeader><DialogTitle>{fm.editTitle}</DialogTitle></DialogHeader>
    <div className="space-y-4"><div><label className="text-sm font-medium">{fm.name}</label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
    <div><label className="text-sm font-medium">{fm.description}</label><Input value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
    <Button onClick={async () => { setSaving(true); await onSave({ name, description: desc }); setSaving(false); onOpenChange(false) }} disabled={saving}>{saving ? fm.saving : fm.save}</Button></div>
  </DialogContent></Dialog>)
}
