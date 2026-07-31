const DAY_MS = 86_400_000

/**
 * Whole-day difference between a date (or ISO string) and today, in days.
 * Negative values mean the date is in the past (overdue).
 */
export function getDayDiff(input: string | Date | null | undefined): number {
  if (!input) return 0
  const date = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(date.getTime())) return 0

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.round((target.getTime() - today.getTime()) / DAY_MS)
}

/**
 * Locale-aware relative time label ("今天", "明天", "3 天后", "today",
 * "tomorrow", "in 3 days" ...). Pass the i18n locale ('zh' | 'en').
 */
export function relativeTime(
  input: string | Date | null | undefined,
  locale: string = 'zh'
): string {
  if (!input) return ''
  const date = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = date.getTime() - Date.now()
  const formatter = new Intl.RelativeTimeFormat(
    locale === 'zh' ? 'zh-CN' : 'en',
    { numeric: 'auto' }
  )
  return formatter.format(Math.round(diffMs / DAY_MS), 'day')
}
