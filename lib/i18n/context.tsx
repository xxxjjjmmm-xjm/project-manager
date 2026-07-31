'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { en } from './dictionaries/en'
import { zh } from './dictionaries/zh'

export type Locale = 'en' | 'zh'
type Dictionary = typeof en

// @ts-expect-error — zh has same structure as en but different literal string values
const dictionaries: Record<Locale, Dictionary> = { en, zh }

interface I18nContextType { locale: Locale; t: Dictionary; setLocale: (l: Locale) => void }
const I18nContext = createContext<I18nContextType | null>(null)

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'zh'
  const stored = localStorage.getItem('pm-locale')
  if (stored === 'en' || stored === 'zh') return stored
  return 'zh'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setLocaleState(getInitialLocale()); setMounted(true) }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('pm-locale', l)
  }, [])

  const value = { locale: mounted ? locale : 'zh', t: dictionaries[mounted ? locale : 'zh'], setLocale }
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
