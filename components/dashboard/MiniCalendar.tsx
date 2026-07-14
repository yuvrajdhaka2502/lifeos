'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { istDateKey, istMonthKey } from '@/lib/date'
import { useCalendar, type MonthRatings } from '@/lib/query/hooks/useCalendar'

/** Rating palette 1–5 (doc 04 §2); un-rated = muted slate. */
export const RATING_COLORS = ['#EF4444', '#F59E0B', '#EAB308', '#84CC16', '#22C55E'] as const
const UNRATED = '#2A2A33'

function monthLabel(monthKey: string) {
  const [y, m] = monthKey.split('-').map(Number)
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${names[m - 1]} ${y}`
}

function shiftMonth(monthKey: string, delta: number) {
  const [y, m] = monthKey.split('-').map(Number)
  const total = y * 12 + (m - 1) + delta
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}

type Props = {
  initialMonth: string // 'YYYY-MM'
  initialRatings: MonthRatings
  weeklyAvg: number | null // mean rating over this week's rated days
}

/** F1/F2 — month heatmap of daily ratings + this-week average pill.
 *  Week columns start Monday (locked decision). Day-detail sheet is F2 (later). */
export function MiniCalendar({ initialMonth, initialRatings, weeklyAvg }: Props) {
  const [month, setMonth] = useState(initialMonth)
  const { data: ratings = {} } = useCalendar(month, month === initialMonth ? initialRatings : undefined)
  const today = istDateKey()

  const [y, m] = month.split('-').map(Number)
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const firstWeekday = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7 // Mon=0

  return (
    <section className="rounded-3xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMonth((mk) => shiftMonth(mk, -1))}
            aria-label="previous month"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted transition hover:border-accent hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[8.5rem] text-center text-sm font-medium">{monthLabel(month)}</span>
          <button
            type="button"
            onClick={() => setMonth((mk) => shiftMonth(mk, 1))}
            disabled={month >= istMonthKey()}
            aria-label="next month"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted transition enabled:hover:border-accent enabled:hover:text-foreground disabled:opacity-40"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="rounded-full border border-border px-2.5 py-1 font-mono text-xs tabular-nums text-muted">
          wk avg {weeklyAvg != null ? `${weeklyAvg.toFixed(1)} ★` : '—'}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="text-[10px] font-medium uppercase text-muted">
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
          const isToday = dateKey === today
          const cls = `flex aspect-square items-center justify-center rounded-lg font-mono text-[10px] tabular-nums ${
            isToday ? 'ring-1 ring-accent' : ''
          } ${rating ? 'text-background' : 'text-muted'}`
          const style = { background: rating ? RATING_COLORS[rating - 1] : UNRATED }
          const title = rating ? `${dateKey} · ${rating}★` : dateKey
          // past/today days deep-link to their editable detail on /calendar (F2)
          return dateKey <= today ? (
            <Link
              key={dateKey}
              href={`/calendar?d=${dateKey}`}
              title={title}
              className={`${cls} transition hover:ring-1 hover:ring-accent/60`}
              style={style}
            >
              {day}
            </Link>
          ) : (
            <div key={dateKey} title={title} className={`${cls} opacity-40`} style={style}>
              {day}
            </div>
          )
        })}
      </div>
    </section>
  )
}
