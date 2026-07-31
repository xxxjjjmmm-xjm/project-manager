'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/hooks/useCalendar'

const MAX_VISIBLE_EVENTS = 3

interface WeekMeta {
  labels: string[]
  firstDay: number
}

function getWeekMeta(locale: string): WeekMeta {
  if (locale === 'zh') {
    return { labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], firstDay: 1 }
  }
  return { labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], firstDay: 0 }
}

function dateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function todayKey(): string {
  return dateKey(new Date())
}

interface CalendarGridProps {
  events: CalendarEvent[]
  month: string
  selectedDate: string | null
  onSelectDate: (date: string) => void
  locale: string
}

export function CalendarGrid({
  events,
  month,
  selectedDate,
  onSelectDate,
  locale,
}: CalendarGridProps) {
  const [year, monthIndex] = month.split('-').map(Number)
  const meta = getWeekMeta(locale)
  const today = todayKey()

  const { cells, eventsByDay } = useMemo(() => {
    const firstDay = new Date(year, monthIndex - 1, 1)
    const offset = (firstDay.getDay() - meta.firstDay + 7) % 7
    const start = new Date(year, monthIndex - 1, 1 - offset)

    const byDay: Record<string, CalendarEvent[]> = {}
    for (const event of events) {
      const key = dateKey(new Date(event.dueDate))
      byDay[key] = byDay[key] ? [...byDay[key], event] : [event]
    }

    const cellDates: Date[] = []
    for (let i = 0; i < 42; i++) {
      cellDates.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
    }

    return { cells: cellDates, eventsByDay: byDay }
  }, [year, monthIndex, meta.firstDay, events])

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111113]">
      <div className="grid grid-cols-7 border-b border-white/[0.06]">
        {meta.labels.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-xs font-medium text-zinc-500"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((date) => {
          const key = dateKey(date)
          const inMonth = date.getMonth() === monthIndex - 1
          const isToday = key === today
          const isSelected = key === selectedDate
          const dayEvents = eventsByDay[key] ?? []
          const visible = dayEvents.slice(0, MAX_VISIBLE_EVENTS)
          const extra = dayEvents.length - visible.length

          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => onSelectDate(key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectDate(key)
                }
              }}
              className={cn(
                'flex min-h-[92px] cursor-pointer flex-col gap-1 border-b border-r border-white/[0.04] p-2 transition hover:bg-white/[0.02] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#3B82F6]/40',
                isSelected && 'bg-[#3B82F6]/[0.06]',
                !inMonth && 'bg-white/[0.01]'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs tabular-nums',
                  isToday
                    ? 'bg-[#3B82F6] font-semibold text-white'
                    : inMonth
                      ? 'text-zinc-300'
                      : 'text-zinc-600'
                )}
              >
                {date.getDate()}
              </span>

              <div className="flex flex-col gap-1">
                {visible.map((event) => (
                  <Link
                    key={event.type + '-' + event.id}
                    href={
                      event.type === 'task'
                        ? `/projects/${event.projectId}#kanban`
                        : `/projects/${event.projectId}`
                    }
                    onClick={(e) => e.stopPropagation()}
                    title={event.title}
                    className={cn(
                      'block truncate rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight transition',
                      event.type === 'task'
                        ? 'bg-[#3B82F6]/15 text-[#3B82F6] hover:bg-[#3B82F6]/25'
                        : 'bg-[#8B5CF6]/15 text-[#8B5CF6] hover:bg-[#8B5CF6]/25'
                    )}
                  >
                    {event.title}
                  </Link>
                ))}
                {extra > 0 && (
                  <span className="px-1.5 text-[10px] tabular-nums text-zinc-500">
                    +{extra}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
