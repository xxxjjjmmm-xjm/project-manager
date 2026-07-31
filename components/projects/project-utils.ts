import type { en } from '@/lib/i18n/dictionaries/en'

export function priorityLabel(priority: string, t: typeof en): string {
  switch (priority) {
    case 'URGENT':
      return t.priority.urgent
    case 'HIGH':
      return t.priority.high
    case 'MEDIUM':
      return t.priority.medium
    case 'LOW':
      return t.priority.low
    default:
      return priority
  }
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString()
}

export function parseTechStack(raw: string | string[]): string[] {
  if (Array.isArray(raw)) return raw
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : []
  } catch {
    return []
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
