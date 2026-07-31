'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType { theme: Theme; resolved: 'light' | 'dark'; setTheme: (t: Theme) => void }
const ThemeContext = createContext<ThemeContextType | null>(null)

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const s = localStorage.getItem('pm-theme')
  if (s === 'light' || s === 'dark' || s === 'system') return s
  return 'dark'
}

function resolve(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
    return 'dark'
  }
  return theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setState] = useState<Theme>('dark')
  const [resolved, setResolved] = useState<'light' | 'dark'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = getInitialTheme(); setState(t); setResolved(resolve(t)); setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const r = resolve(theme); setResolved(r)
    document.documentElement.classList.toggle('dark', r === 'dark')
  }, [theme, mounted])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const h = () => setResolved(resolve('system'))
    mq.addEventListener('change', h); return () => mq.removeEventListener('change', h)
  }, [theme])

  const setTheme = useCallback((t: Theme) => { setState(t); localStorage.setItem('pm-theme', t) }, [])

  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : 'dark', resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
