'use client'

import { I18nProvider } from '@/lib/i18n/context'
import { ThemeProvider } from '@/lib/theme/context'
import { AppShell } from '@/components/layout/AppShell'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppShell>
          {children}
        </AppShell>
        <Toaster />
      </I18nProvider>
    </ThemeProvider>
  )
}
