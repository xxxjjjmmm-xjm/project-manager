'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

const TabsCtx = React.createContext<{ v: string; setV: (v: string) => void }>({ v: '', setV: () => {} })

function Tabs({ defaultValue, children }: { defaultValue: string; children: React.ReactNode; className?: string }) {
  const [v, setV] = React.useState(defaultValue)
  return <TabsCtx.Provider value={{ v, setV }}>{children}</TabsCtx.Provider>
}

function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 p-1', className)}>{children}</div>
}

function TabsTrigger({ value, children }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsCtx)
  return <button onClick={() => ctx.setV(value)} className={cn('inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium', ctx.v === value ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500')}>{children}</button>
}

function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsCtx)
  return ctx.v === value ? <div className={className}>{children}</div> : null
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
