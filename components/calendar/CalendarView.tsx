'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { istDateKey, istMonthKey } from '@/lib/date'
import { useCalendar, useWeekAverage } from '@/lib/query/hooks/useCalendar'
import { RATING_COLORS } from '@/components/dashboard/MiniCalendar'
import { DayDetailSheet } from './DayDetailSheet'

const UNRATED = '#2A2A33'

function monthLabel(monthKey: string) {
  const [y, m] = monthKey.split('-').map(Number)
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${names[m - 1]} ${y}`
}
const shiftMonth = (monthKey: string, delta: number) => {
  const [y, m] = monthKey.split('-').map(Number)
  const total = y * 12 + (m - 1) + delta
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}

/** F2 — the full calendar page: month heatmap (rating buckets), weekly-average
 *  pill, month navigation; tapping a past/today day opens its editable
 *  DayDetailSheet. Deep-linkable via /calendar?d=YYYY-MM-DD. */
export function CalendarView({ initialSelected }: { initialSelected: string | null }) {
  const today = istDateKey()
  const [month, setMonth] = useState(initialSelected?.slice(0, 7) ?? istMonthKey())
  const [selected, setSelected] = useState<string | null>(initialSelected)
  const { data: ratings = {} } = useCalendar(month)
  const { data: weeklyAvg } = useWeekAverage()

  const [y, m] = month.split('-').map(Number)
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const firstWeekday = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7 // Mon=0

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
        <span className="rounded-full border border-border px-2.5 py-1 font-mono text-xs tabular-nums text-muted">
          wk avg {weeklyAvg != null ? `${weeklyAvg.toFixed(1)} ★` : '—'}
        </span>
      </div>

      <div className="rounded-3xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setMonth((mk) => shiftMonth(mk, -1))}
            aria-label="previous month"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition hover:border-accent hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[10rem] text-center text-sm font-medium">{monthLabel(month)}</span>
          <button
            type="button"
            onClick={() => setMonth((mk) => shiftMonth(mk, 1))}
            disabled={month >= istMonthKey()}
            aria-label="next month"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition enabled:hover:border-accent enabled:hover:text-foreground disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <span key={d} className="text-[10px] font-medium uppercase text-muted">
              {d}
            </span>
          ))}
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateKey = `${month}-${String(day).padStart(2, '0')}`
            const rating = ratings[dateKey]
            const future = dateKey > today
            return (
              <button
                key={dateKey}
                type="button"
                disabled={future}
                onClick={() => setSelected(dateKey)}
                title={rating ? `${dateKey} · ${rating}★` : dateKey}
                className={`flex aspect-square items-center justify-center rounded-xl font-mono text-xs tabular-nums transition ${
                  dateKey === today ? 'ring-1 ring-accent' : ''
                } ${future ? 'opacity-30' : 'hover:ring-1 hover:ring-accent/60'} ${
                  rating ? 'text-background' : 'text-muted'
                }`}
                style={{ background: rating ? RATING_COLORS[rating - 1] : UNRATED }}
              >
                {day}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted">
          <span>1★</span>
          {RATING_COLORS.map((c) => (
            <span key={c} className="h-2.5 w-2.5 rounded" style={{ background: c }} />
          ))}
          <span>5★</span>
        </div>
      </div>

      {selected && <DayDetailSheet dateKey={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
