'use client'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import type { ScanPathItem } from '@/lib/types'
import type { en } from '@/lib/i18n/dictionaries/en'

export function ScanPathList({ paths, onToggle, onDelete, t }: {
  paths: ScanPathItem[]; onToggle: (id: string, e: boolean) => void; onDelete: (id: string) => void; t: typeof en
}) {
  const st = t.settings
  if (!paths.length) return <p className="text-sm text-muted-foreground">{st.noPaths}</p>
  return <ul className="space-y-2">{paths.map((p) => <li key={p.id} className="flex items-center justify-between border rounded-lg p-3"><code className="text-sm truncate flex-1">{p.path}</code><div className="flex gap-2 ml-4"><Button variant={p.enabled ? 'secondary' : 'outline'} size="sm" onClick={() => onToggle(p.id, !p.enabled)}>{p.enabled ? st.on : st.off}</Button><Button variant="ghost" size="sm" onClick={() => onDelete(p.id)}><Trash2 className="h-3 w-3 text-red-500" /></Button></div></li>)}</ul>
}
