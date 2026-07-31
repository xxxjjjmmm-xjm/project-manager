'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { en } from '@/lib/i18n/dictionaries/en'

export function ScanPathForm({ onSubmit, t }: { onSubmit: (path: string) => void; t: typeof en }) {
  const [path, setPath] = useState('')
  const add = () => { if (!path.trim()) return; onSubmit(path); setPath('') }
  return <div className="flex gap-2"><Input placeholder={t.settings.pathPlaceholder} value={path} onChange={(e) => setPath(e.target.value)} className="max-w-sm" onKeyDown={(e) => e.key === 'Enter' && add()} /><Button onClick={add}>{t.settings.addPath}</Button></div>
}
