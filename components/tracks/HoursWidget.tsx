'use client'
import { Minus, Plus } from 'lucide-react'
import { useHours, useSetHours } from '@/lib/query/hooks/useHours'

/** Daily hours logger (F4a): today's hours in 0.5 steps + this week's Σ.
 *  Normally filled at the 10 PM prompt; editable here anytime. */
export function HoursWidget({ trackId }: { trackId: string }) {
  const { data } = useHours(trackId)
  const setHours = useSetHours(trackId)
  const today = data?.today ?? 0

  const step = (delta: number) => {
    const next = Math.max(0, Math.round((today + delta) * 2) / 2)
    setHours.mutate(next)
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-0.5)}
          aria-label="minus 30 minutes"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted transition hover:border-accent hover:text-accent"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-[3.5rem] text-center font-mono text-lg font-semibold tabular-nums">
          {today.toFixed(1)}h
        </span>
        <button
          type="button"
          onClick={() => step(0.5)}
          aria-label="plus 30 minutes"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted transition hover:border-accent hover:text-accent"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="border-l border-border pl-3 text-xs leading-tight text-muted">
        <div>today</div>
        <div className="font-mono tabular-nums">
          Σ {Number(data?.weekTotal ?? 0).toFixed(1)}h <span className="text-[10px]">this wk</span>
        </div>
      </div>
    </div>
  )
}
