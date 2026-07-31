'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { useCalendar, currentMonthKey, shiftMonthKey } from '@/hooks/useCalendar'
import type { CalendarEvent } from '@/hooks/useCalendar'
import { useI18n } from '@/lib/i18n/context'
import type { en } from '@/lib/i18n/dictionaries/en'

function todayKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`
}

function formatDayLabel(dateKey: string, locale: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(
    locale === 'zh' ? 'zh-CN' : 'en',
    { month: 'long', day: 'numeric', weekday: 'short' }
  )
}

function DayEventRow({ event, t }: { event: CalendarEvent; t: typeof en }) {
  const href =
    event.type === 'task'
      ? `/projects/${event.projectId}#kanban`
      : `/projects/${event.projectId}`
  return (
    <li>
      <Link
        href={href}
        className="flex items-center justify-between gap-3 px-1 py-3 transition hover:bg-white/[0.02]"
      >
        <div className="min-w-0">
          <p className="truncate text-sm text-zinc-200">{event.title}</p>
          <p className="mt-0.5 truncate text-xs text-zinc-500">
            {event.type === 'task'
              ? event.projectName ?? t.calendarPage.task
              : t.calendarPage.project}
          </p>
        </div>
        <StatusBadge status={event.status} size="sm" t={t} />
      </Link>
    </li>
  )
}

export default function CalendarPage() {
  const { t, locale } = useI18n()
  const { month, setMonth, events, isLoading, isError, retry } = useCalendar()
  const [mounted, setMounted] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    setSelectedDate(todayKey())
    setMounted(true)
  }, [])

  const monthLabel = useMemo(() => {
    const [year, monthIndex] = month.split('-').map(Number)
    return new Date(year, monthIndex - 1, 1).toLocaleDateString(
      locale === 'zh' ? 'zh-CN' : 'en',
      { year: 'numeric', month: 'long' }
    )
  }, [month, locale])

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return []
    return events.filter((event) => {
      const date = new Date(event.dueDate)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(date.getDate()).padStart(2, '0')}`
      return key === selectedDate
    })
  }, [events, selectedDate])

  const goToday = () => {
    setMonth(currentMonthKey())
    setSelectedDate(todayKey())
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">{t.calendarPage.title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>
            {t.calendarPage.today}
          </Button>
          <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] p-0.5">
            <button
              type="button"
              aria-label="previous-month"
              onClick={() => setMonth(shiftMonthKey(month, -1))}
              className="rounded-md p-1.5 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[8rem] text-center text-sm font-semibold text-zinc-200">
              {monthLabel}
            </span>
            <button
              type="button"
              aria-label="next-month"
              onClick={() => setMonth(shiftMonthKey(month, 1))}
              className="rounded-md p-1.5 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isError ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111113] px-6 py-16 text-center">
          <p className="text-sm text-zinc-400">{t.calendarPage.loadFailed}</p>
          <button
            type="button"
            onClick={retry}
            className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
          >
            {t.common.retry}
          </button>
        </div>
      ) : (
        <>
          <CalendarGrid
            events={events}
            month={month}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            locale={locale}
          />

          <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-5">
            <h3 className="mb-3 text-sm font-semibold text-zinc-200">
              {t.calendarPage.dayEvents}
              {selectedDate && mounted && (
                <span className="ml-2 text-xs font-normal text-zinc-500">
                  {formatDayLabel(selectedDate, locale)}
                </span>
              )}
            </h3>
            {!isLoading && selectedEvents.length === 0 ? (
              <p className="text-sm text-zinc-500">{t.calendarPage.noEvents}</p>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {selectedEvents.map((event) => (
                  <DayEventRow key={event.type + '-' + event.id} event={event} t={t} />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
