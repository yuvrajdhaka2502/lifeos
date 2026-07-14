'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { periodKey } from '@/lib/date'
import { useCompletions, useToggleItem } from '@/lib/query/hooks/useCompletions'
import { AuraCompletion, useAuraTrigger } from './AuraCompletion'
import { HoursWidget } from './HoursWidget'
import { PhaseChecklist } from './PhaseChecklist'
import { PhaseStepper } from './PhaseStepper'
import { PinnedPanel } from './PinnedPanel'
import type { ItemData, PhaseData, TrackInfo } from './types'

type Props = { track: TrackInfo; phases: PhaseData[] }

/** F4a — the phased track page (Study): phase stepper + navigable phase pages
 *  (static ticks) + always-visible pinned panels + daily hours.
 *  Phased pages are static-scope by design (PRD F4a), so one completions query
 *  for (track, 'static') feeds the stepper %, the page and the pinned panels. */
export function PhasedTrackPage({ track, phases }: Props) {
  const navPhases = phases.filter((p) => p.layout === 'phase')
  const pinned = phases.filter((p) => p.layout === 'pinned')
  const period = periodKey('static')

  const storageKey = `lifeos:${track.slug}:active-phase`
  const [active, setActive] = useState(0)
  const direction = useRef(1)

  // restore the remembered phase after mount (localStorage is client-only)
  useEffect(() => {
    const saved = Number(localStorage.getItem(storageKey))
    if (!Number.isNaN(saved) && saved >= 0 && saved < navPhases.length) setActive(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  const select = (i: number) => {
    direction.current = i > active ? 1 : -1
    setActive(i)
    localStorage.setItem(storageKey, String(i))
  }

  const { data: completions = {}, isSuccess } = useCompletions(track.id, period)
  const toggle = useToggleItem(track.id, period)
  const onToggle = (item: ItemData, next: { completed: boolean; count: number }) =>
    toggle.mutate({ itemId: item.id, phaseId: item.phase_id, ...next })
  const { aura, dismiss } = useAuraTrigger(phases, completions, isSuccess)

  const phase = navPhases[active]
  const totalItems = navPhases.reduce((s, p) => s + p.items.length, 0)
  const totalDone = navPhases.reduce(
    (s, p) => s + p.items.filter((i) => completions[i.id]?.completed).length,
    0,
  )

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition hover:border-accent hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{track.name}</h1>
            <p className="font-mono text-xs tabular-nums text-muted">
              {totalDone}/{totalItems} done overall
            </p>
          </div>
        </div>
        {track.tracks_hours && <HoursWidget trackId={track.id} />}
      </div>

      <PhaseStepper phases={navPhases} activeIndex={active} completions={completions} onSelect={select} />

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative min-w-0">
          <AuraCompletion aura={aura} onDone={dismiss} accent={track.color ?? undefined} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={phase?.id ?? 'empty'}
              initial={{ opacity: 0, x: 32 * direction.current }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 * direction.current }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              {phase ? (
                <>
                  <div className="mb-3">
                    <h2 className="text-lg font-medium">{phase.title}</h2>
                    {phase.subtitle && <p className="mt-0.5 text-sm text-muted">{phase.subtitle}</p>}
                  </div>
                  <PhaseChecklist phase={phase} completions={completions} onToggle={onToggle} />
                </>
              ) : (
                <p className="text-sm text-muted">No phases in this track yet.</p>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              disabled={active === 0}
              onClick={() => select(active - 1)}
              className="flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm text-muted transition enabled:hover:border-accent enabled:hover:text-foreground disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button
              type="button"
              disabled={active >= navPhases.length - 1}
              onClick={() => select(active + 1)}
              className="flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm text-muted transition enabled:hover:border-accent enabled:hover:text-foreground disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {pinned.length > 0 && (
          <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
            <p className="px-1 text-[11px] font-medium uppercase tracking-wider text-muted">Pinned</p>
            {pinned.map((p) => (
              <PinnedPanel key={p.id} phase={p} completions={completions} onToggle={onToggle} />
            ))}
          </aside>
        )}
      </div>
    </div>
  )
}
