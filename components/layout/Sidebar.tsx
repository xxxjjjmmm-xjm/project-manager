'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  Users,
  FileStack,
  Search,
  Settings,
  Globe,
  Sun,
  Moon,
  Monitor,
  Github,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import { useTheme } from '@/lib/theme/context'

export function Sidebar() {
  const pathname = usePathname()
  const { t, locale, setLocale } = useI18n()
  const { theme, setTheme } = useTheme()

  const links = [
    { href: '/', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/projects', label: t.nav.projects, icon: FolderKanban },
    { href: '/tasks', label: t.nav.tasks, icon: CheckSquare },
    { href: '/calendar', label: t.nav.calendar, icon: Calendar },
    { href: '/team', label: t.nav.team, icon: Users },
    { href: '/files', label: t.nav.files, icon: FileStack },
    { href: '/search', label: t.nav.search, icon: Search },
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
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-white/[0.06] bg-[#09090B]">
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-5 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 via-violet-500 to-cyan-400">
          <FolderKanban className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="bg-gradient-to-r from-blue-600 via-violet-500 to-cyan-400 bg-clip-text text-lg font-bold leading-tight text-transparent">
            {t.app.brand}
          </h1>
          <p className="text-xs text-zinc-500">{t.app.subtitle}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-white/[0.06] font-medium text-white'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-2 border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-1">
          <button
            onClick={cycleLocale}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            <Globe className="h-3.5 w-3.5" />
            {locale === 'zh' ? '中文' : 'EN'}
          </button>
          <button
            onClick={cycleTheme}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            {(() => { const I = themeIcons[theme] || Monitor; return <I className="h-3.5 w-3.5" /> })()}
            {t.sidebar[theme]}
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{t.sidebar.version}</span>
          <a
            href="https://github.com/xxxjjjmmm-xjm/project-manager"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-white"
          >
            <Github className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </aside>
  )
}
