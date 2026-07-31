'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

export function StatCard({ icon, label, value, sub, accent = false }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5 backdrop-blur">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-[#3B82F6]">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-zinc-400">{label}</p>
          <p
            className={cn(
              'text-3xl font-bold text-white',
              accent &&
                'bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent'
            )}
          >
            {value}
          </p>
          {sub && <p className="mt-0.5 truncate text-xs text-zinc-500">{sub}</p>}
        </div>
      </div>
    </div>
  )
}
