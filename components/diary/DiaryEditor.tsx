'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { istDateKey } from '@/lib/date'
import { useDailyLog } from '@/lib/query/hooks/useDailyLog'
import { DiaryField } from '@/components/calendar/DayDetailSheet'

function shiftDate(dateKey: string, delta: number) {
  const d = new Date(`${dateKey}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

/** F6 — the diary page: one clean autosaving writing surface per date,
 *  with prev/next-day navigation (future days locked). */
export function DiaryEditor() {
  const today = istDateKey()
  const [dateKey, setDateKey] = useState(today)
  const { data, isSuccess } = useDailyLog(dateKey)

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-5 flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Diary</h1>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setDateKey((d) => shiftDate(d, -1))}
            aria-label="previous day"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition hover:border-accent hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDateKey(today)}
            disabled={dateKey === today}
            className="rounded-lg border border-border px-2.5 py-1.5 font-mono text-xs tabular-nums text-muted transition enabled:hover:border-accent enabled:hover:text-foreground disabled:opacity-60"
          >
            {dateKey === today ? 'Today' : dateKey}
          </button>
          <button
            type="button"
            onClick={() => setDateKey((d) => shiftDate(d, 1))}
            disabled={dateKey >= today}
            aria-label="next day"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition enabled:hover:border-accent enabled:hover:text-foreground disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-4">
        {isSuccess ? (
          <DiaryField key={dateKey} dateKey={dateKey} initial={data.diary ?? ''} rows={14} />
        ) : (
          <div className="h-72 animate-pulse rounded-2xl bg-white/[0.03]" />
        )}
      </div>
    </div>
  )
}
