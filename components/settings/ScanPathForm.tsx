'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ScanPathForm({ onSubmit }: { onSubmit: (path: string) => void }) {
  const [path, setPath] = useState('')
  const add = () => { if (!path.trim()) return; onSubmit(path); setPath('') }
  return (
    <div className="flex gap-2">
      <Input placeholder="e.g. d:/projects" value={path} onChange={(e) => setPath(e.target.value)} className="max-w-sm" onKeyDown={(e) => e.key === 'Enter' && add()} />
      <Button onClick={add}>Add Path</Button>
    </div>
  )
}
