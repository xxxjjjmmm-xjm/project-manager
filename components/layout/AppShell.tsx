'use client'

import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { useStats } from '@/hooks/useStats'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { stats } = useStats()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav lastScannedAt={stats?.lastScannedAt} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
