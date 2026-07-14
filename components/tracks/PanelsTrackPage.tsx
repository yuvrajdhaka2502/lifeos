'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { istDateKey, istLastWeekKey, istWeekdayShort, periodKey } from '@/lib/date'
import { useCompletions, useToggleItem } from '@/lib/query/hooks/useCompletions'
import { useDailyLog, useSetDietSatisfaction } from '@/lib/query/hooks/useDailyLog'
import { AuraCompletion, useAuraTrigger } from './AuraCompletion'
import { ExerciseProgress } from './ExerciseProgress'
import { PhaseChecklist } from './PhaseChecklist'
import type { ItemData, PhaseData, TrackInfo } from './types'

type Props = { track: TrackInfo; phases: PhaseData[] }

/** F4b/F4c/F4d — the panels track page (Gym, Diet). Each panel keys its ticks
 *  by its own period scope: a new week/day simply has no completion rows yet,
 *  so it renders unchecked automatically (arch §3 — no generation job). */
export function PanelsTrackPage({ track, phases }: Props) {
  const panels = phases.filter((p) => p.layout === 'panel')
  const isDiet = track.slug === 'diet'

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition hover:border-accent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">{track.name}</h1>
      </div>

      <div className="space-y-6">
        {panels.map((phase, idx) => (
          <div key={phase.id} className="space-y-6">
            <PanelCard track={track} phase={phase} />
            {/* Diet: today's 1–3 satisfaction sits between Daily Meals and the Weekly Protocol (F4c) */}
            {isDiet && idx === 0 && <DietSatisfaction />}
          </div>
        ))}
      </div>
    </div>
  )
}

function PanelCard({ track, phase }: { track: TrackInfo; phase: PhaseData }) {
  const isGym = track.slug === 'gym'
  const weekly = phase.period_scope === 'weekly'
  const period = periodKey(phase.period_scope)

  const { data: completions = {}, isSuccess } = useCompletions(track.id, period)
  // last-week score (F4b/F4d) — only meaningful for weekly panels
  const { data: lastWeek = {} } = useCompletions(track.id, istLastWeekKey(), weekly)
  const toggle = useToggleItem(track.id, period)

  const onToggle = (item: ItemData, next: { completed: boolean; count: number }) =>
    toggle.mutate({ itemId: item.id, phaseId: item.phase_id, ...next })
  const { aura, dismiss } = useAuraTrigger([phase], completions, isSuccess)

  const total = phase.items.length
  const done = phase.items.filter((i) => completions[i.id]?.completed).length
  const lastDone = phase.items.filter((i) => lastWeek[i.id]?.completed).length
  const today = istWeekdayShort()

  return (
    <section className="relative">
      <AuraCompletion aura={aura} onDone={dismiss} accent={track.color ?? undefined} />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-medium">{phase.title}</h2>
          {phase.subtitle && <p className="mt-0.5 text-xs text-muted">{phase.subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-card px-2.5 py-1 font-mono text-xs tabular-nums">
            {done}/{total} {weekly ? 'this wk' : 'today'}
          </span>
          {weekly && (
            <span className="rounded-full border border-border px-2.5 py-1 font-mono text-xs tabular-nums text-muted">
              last wk {lastDone}
            </span>
          )}
        </div>
      </div>

      <PhaseChecklist
        phase={phase}
        completions={completions}
        onToggle={onToggle}
        highlightSection={isGym ? (title) => title.startsWith(today) : undefined}
        renderExtra={isGym ? (item) => <ExerciseProgress item={item} /> : undefined}
      />
    </section>
  )
}

const FACES = [
  { value: 1, label: '😞', hint: 'junk / skipped' },
  { value: 2, label: '😐', hint: 'minor deviation' },
  { value: 3, label: '😀', hint: 'ideal' },
] as const

function DietSatisfaction() {
  const todayKey = istDateKey()
  const { data } = useDailyLog(todayKey)
  const set = useSetDietSatisfaction(todayKey)
  const current = data?.diet_satisfaction ?? null

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
      <div>
        <p className="text-sm font-medium">Diet today</p>
        <p className="text-xs text-muted">
          {current ? FACES.find((f) => f.value === current)?.hint : 'also asked at the 10 PM prompt'}
        </p>
      </div>
      <div className="flex gap-1.5">
        {FACES.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => set.mutate(f.value)}
            aria-label={`diet satisfaction ${f.value} — ${f.hint}`}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition ${
              current === f.value
                ? 'border-accent bg-accent/15'
                : 'border-border opacity-60 hover:border-accent/50 hover:opacity-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
