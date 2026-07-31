'use client'

import { cn } from '@/lib/utils'

const techColors: Record<string, string> = {
  next: 'bg-black text-white', react: 'bg-blue-400 text-white',
  vue: 'bg-emerald-500 text-white', svelte: 'bg-orange-500 text-white',
  tailwindcss: 'bg-cyan-500 text-white', prisma: 'bg-indigo-600 text-white',
  typescript: 'bg-blue-600 text-white', javascript: 'bg-yellow-400 text-black',
  python: 'bg-yellow-500 text-black', rust: 'bg-orange-700 text-white',
  go: 'bg-cyan-400 text-black',
}

const typeColors: Record<string, string> = {
  web: 'bg-blue-100 text-blue-800', cli: 'bg-gray-100 text-gray-800',
  library: 'bg-purple-100 text-purple-800', mobile: 'bg-green-100 text-green-800',
  desktop: 'bg-amber-100 text-amber-800', script: 'bg-rose-100 text-rose-800',
  other: 'bg-slate-100 text-slate-800',
}

interface BadgeProps {
  variant?: 'tech' | 'type' | 'default'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const key = String(children).toLowerCase()
  const variantClass =
    variant === 'tech' ? (techColors[key] || 'bg-gray-100 text-gray-700') :
    variant === 'type' ? (typeColors[key] || typeColors.other) :
    'bg-gray-100 text-gray-700'

  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
      variantClass, className
    )}>
      {children}
    </span>
  )
}
