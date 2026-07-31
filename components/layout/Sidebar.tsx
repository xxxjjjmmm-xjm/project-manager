'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, FolderGit2, Settings, Globe, Sun, Moon, Monitor, Github } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import { useTheme } from '@/lib/theme/context'

export function Sidebar() {
  const pathname = usePathname()
  const { t, locale, setLocale } = useI18n()
  const { theme, setTheme } = useTheme()

  const links = [
    { href: '/', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/projects', label: t.nav.projects, icon: FolderGit2 },
    { href: '/settings', label: t.nav.settings, icon: Settings },
  ]

  const cycleLocale = () => setLocale(locale === 'zh' ? 'en' : 'zh')
  const cycleTheme = () => {
    const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const idx = order.indexOf(theme)
    setTheme(order[(idx + 1) % order.length])
  }
  const themeIcons: Record<string, typeof Sun> = { light: Sun, dark: Moon, system: Monitor }

  return (
    <aside className="w-56 border-r bg-card flex flex-col h-screen">
      <div className="p-4 border-b">
        <h1 className="text-lg font-bold tracking-tight">{t.app.title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t.app.subtitle}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-3 space-y-2">
        <div className="flex items-center gap-1">
          <button onClick={cycleLocale} className="flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs hover:bg-accent transition-colors">
            <Globe className="h-3.5 w-3.5" />
            {locale === 'zh' ? '中文' : 'EN'}
          </button>
          <button onClick={cycleTheme} className="flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs hover:bg-accent transition-colors">
            {(() => { const I = themeIcons[theme] || Monitor; return <I className="h-3.5 w-3.5" /> })()}
            {t.sidebar[theme]}
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t.sidebar.version}</span>
          <a href="https://github.com/xxxjjjmmm-xjm/project-manager" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
            <Github className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </aside>
  )
}
