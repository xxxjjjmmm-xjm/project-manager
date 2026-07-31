'use client'

import { Search } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export function TopBar() {
  const { t, locale } = useI18n()

  const today = new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#09090B]/80 px-6 backdrop-blur">
      <div className="text-sm text-zinc-400">{today}</div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
        >
          <Search className="h-4 w-4" />
          <span>{t.topBar.search}</span>
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
            ⌘K
          </kbd>
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-violet-500 to-cyan-400 text-xs font-bold text-white">
          U
        </div>
      </div>
    </header>
  )
}
