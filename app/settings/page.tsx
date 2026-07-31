'use client'

import { useEffect, useState, type ReactNode } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { FileStack, FolderKanban, ListTodo, LogOut, Plus, UserPlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScanPathForm } from '@/components/settings/ScanPathForm'
import { ScanPathList } from '@/components/settings/ScanPathList'
import { ScanTrigger } from '@/components/settings/ScanTrigger'
import { InviteMemberDialog } from '@/components/team/InviteMemberDialog'
import { useI18n } from '@/lib/i18n/context'
import { useTheme } from '@/lib/theme/context'
import { useTeam } from '@/hooks/useTeam'
import { useTags } from '@/hooks/useTags'
import { useScanPaths } from '@/hooks/useScanPaths'
import { useScan } from '@/hooks/useScan'
import { cn } from '@/lib/utils'
import type { DashboardStats } from '@/lib/types'

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url)
    .then((r) => r.json())
    .then((d: { data: T }) => d.data)

interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl: string
}

interface WorkspaceInfo {
  id: string
  name: string
  avatarUrl: string
}

interface FileListMeta {
  total: number
}

const TABS = [
  { key: 'account', labelKey: 'account' },
  { key: 'workspace', labelKey: 'workspace' },
  { key: 'members', labelKey: 'members' },
  { key: 'appearance', labelKey: 'appearance' },
  { key: 'integrations', labelKey: 'integrations' },
  { key: 'data', labelKey: 'data' },
] as const

type TabKey = (typeof TABS)[number]['key']

function roleLabel(role: string): string {
  switch (role) {
    case 'OWNER':
      return 'Owner'
    case 'ADMIN':
      return 'Admin'
    case 'VIEWER':
      return 'Viewer'
    default:
      return 'Member'
  }
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#111113] p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-300">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-lg font-bold text-white">{value}</p>
        <p className="truncate text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  )
}

function AccountTab() {
  const { t } = useI18n()
  const router = useRouter()
  const { data: user } = useSWR<AuthUser>('/api/auth/me', fetcher)
  const [loggingOut, setLoggingOut] = useState(false)

  const logout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.push('/')
      router.refresh()
    }
  }

  if (!user) {
    return <p className="text-sm text-zinc-500">{t.settingsPage.notAuthenticated}</p>
  }

  const initials = (user.name || '?').charAt(0).toUpperCase()

  return (
    <div className="max-w-xl space-y-4">
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-violet-500 to-cyan-400 text-lg font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-white">{user.name}</p>
            <p className="truncate text-sm text-zinc-400">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-400">{t.settingsPage.name}</p>
            <p className="text-sm text-white">{user.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-400">{t.settingsPage.email}</p>
            <p className="text-sm text-white">{user.email}</p>
          </div>
          <p className="text-xs text-zinc-500">{t.settingsPage.passwordNote}</p>
          <Button variant="outline" size="sm" onClick={logout} disabled={loggingOut}>
            <LogOut className="h-4 w-4" /> {t.settingsPage.logout}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function WorkspaceTab() {
  const { t } = useI18n()
  const { data: workspace, mutate } = useSWR<WorkspaceInfo>('/api/workspace', fetcher)
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  useEffect(() => {
    if (workspace) {
      setName(workspace.name)
      setAvatarUrl(workspace.avatarUrl || '')
    }
  }, [workspace])

  const save = async () => {
    setSaving(true)
    setStatus('idle')
    try {
      const res = await fetch('/api/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatarUrl: avatarUrl || undefined }),
      })
      const json = await res.json()
      if (json.success) {
        setStatus('saved')
        await mutate()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  if (!workspace) {
    return <p className="text-sm text-zinc-500">{t.settingsPage.loadFailed}</p>
  }

  return (
    <div className="max-w-xl space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">{t.settingsPage.workspaceName}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">{t.settingsPage.avatarUrl}</label>
            <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? t.settingsPage.saving : t.settingsPage.save}
            </Button>
            {status === 'saved' && <span className="text-xs text-emerald-400">{t.settingsPage.saved}</span>}
            {status === 'error' && <span className="text-xs text-red-400">{t.settingsPage.saveFailed}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MembersTab() {
  const { t } = useI18n()
  const { members, isLoading, error, inviteMember, retry } = useTeam()
  const [inviteOpen, setInviteOpen] = useState(false)

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111113] px-6 py-12 text-center">
        <p className="text-sm text-zinc-400">{t.settingsPage.loadFailed}</p>
        <Button variant="outline" size="sm" onClick={retry}>
          {t.common.retry}
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return <p className="text-sm text-zinc-500">{t.settingsPage.loadFailed}</p>
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs tabular-nums text-zinc-400">
          {members.length}
        </span>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-4 w-4" /> {t.settingsPage.invite}
        </Button>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-zinc-500">{t.teamPage.noMembers}</p>
      ) : (
        <ul className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-[#111113]">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs font-bold text-white">
                  {(member.name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{member.name}</p>
                  <p className="truncate text-xs text-zinc-500">{member.email}</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-white/[0.08] px-2 py-0.5 text-[11px] text-zinc-300">
                {roleLabel(member.role)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={inviteMember}
        t={t}
      />
    </div>
  )
}

function AppearanceTab() {
  const { t, locale, setLocale } = useI18n()
  const { theme, setTheme } = useTheme()

  return (
    <div className="max-w-xl space-y-4">
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">{t.settingsPage.theme}</label>
            <Select value={theme} onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t.settingsPage.light}</SelectItem>
                <SelectItem value="dark">{t.settingsPage.dark}</SelectItem>
                <SelectItem value="system">{t.settingsPage.system}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">{t.settingsPage.locale}</label>
            <Select value={locale} onValueChange={(v) => setLocale(v as 'en' | 'zh')}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh">{t.settingsPage.chinese}</SelectItem>
                <SelectItem value="en">{t.settingsPage.english}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function IntegrationsTab() {
  const { t } = useI18n()
  const { paths, isLoading, create, update, remove, refetch } = useScanPaths()
  const { isScanning, triggerScan, lastScan } = useScan()

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold text-white">{t.settingsPage.importPlugin}</h3>
          <p className="mt-1 text-sm text-zinc-400">{t.settingsPage.importPluginDesc}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">{t.settings.scanPaths}</h4>
            <ScanPathForm
              onSubmit={async (path) => {
                await create(path)
                refetch()
              }}
              t={t}
            />
            {isLoading ? (
              <p className="text-sm text-zinc-500">{t.settingsPage.loadFailed}</p>
            ) : (
              <ScanPathList
                paths={paths}
                onToggle={(id, enabled) => update(id, { enabled })}
                onDelete={(id) => {
                  remove(id)
                  refetch()
                }}
                t={t}
              />
            )}
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">{t.settings.manualScan}</h4>
            <ScanTrigger onScan={() => triggerScan()} isScanning={isScanning} lastScan={lastScan} t={t} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DataTab() {
  const { t } = useI18n()
  const { data: stats } = useSWR<DashboardStats>('/api/dashboard/stats', fetcher)
  const { data: filesMeta } = useSWR<FileListMeta>('/api/files?limit=1', fetcher)
  const { tags, create, remove } = useTags()
  const [newTag, setNewTag] = useState('')

  const addTag = async () => {
    const name = newTag.trim()
    if (!name) return
    await create(name)
    setNewTag('')
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={t.settingsPage.projects}
          value={stats?.totalProjects ?? 0}
          icon={<FolderKanban className="h-4 w-4" />}
        />
        <StatCard
          label={t.settingsPage.tasks}
          value={stats?.totalTasks ?? 0}
          icon={<ListTodo className="h-4 w-4" />}
        />
        <StatCard
          label={t.settingsPage.files}
          value={filesMeta?.total ?? 0}
          icon={<FileStack className="h-4 w-4" />}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <h4 className="mb-3 text-sm font-semibold text-white">{t.settingsPage.tags}</h4>
          {tags.length === 0 ? (
            <p className="mb-3 text-sm text-zinc-500">{t.settingsPage.noTags}</p>
          ) : (
            <div className="mb-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                >
                  {tag.name}
                  <button type="button" aria-label="remove tag" onClick={() => remove(tag.id)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder={t.settingsPage.newTag}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="max-w-[180px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') void addTag()
              }}
            />
            <Button variant="outline" size="sm" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SettingsPage() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<TabKey>('account')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t.settings.title}</h1>

      <div className="flex gap-1 overflow-x-auto border-b border-white/[0.06]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              '-mb-px shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'border-[#3B82F6] text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            )}
          >
            {t.settingsPage[tab.labelKey]}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'workspace' && <WorkspaceTab />}
        {activeTab === 'members' && <MembersTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
        {activeTab === 'integrations' && <IntegrationsTab />}
        {activeTab === 'data' && <DataTab />}
      </div>
    </div>
  )
}
