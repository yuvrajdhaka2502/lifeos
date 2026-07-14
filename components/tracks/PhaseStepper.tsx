'use client'
import { motion } from 'framer-motion'
import type { CompletionMap } from '@/lib/query/hooks/useCompletions'
import type { PhaseData } from './types'

type Props = {
  phases: PhaseData[]
  activeIndex: number
  completions: CompletionMap
  onSelect: (index: number) => void
}

/** Segmented phase navigation (doc 04 §5.2): one node per phase page with its
 *  % complete; tap a node to jump. Horizontally scrollable on phone. */
export function PhaseStepper({ phases, activeIndex, completions, onSelect }: Props) {
  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
      {phases.map((p, i) => {
        const total = p.items.length
        const done = p.items.filter((it) => completions[it.id]?.completed).length
        const pct = total ? Math.round((done / total) * 100) : 0
        const active = i === activeIndex
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(i)}
            title={p.title}
            className={`relative flex shrink-0 flex-col items-center gap-1 rounded-xl border px-2.5 py-1.5 transition ${
              active ? 'border-accent/70 bg-accent/10' : 'border-border bg-card hover:border-accent/40'
            }`}
          >
            <span
              className={`font-mono text-[11px] tabular-nums ${active ? 'text-accent' : pct === 100 ? 'text-foreground' : 'text-muted'}`}
            >
              {shortLabel(p.title, i)}
            </span>
            <span className="h-0.5 w-8 overflow-hidden rounded-full bg-border">
              <motion.span
                className={`block h-full rounded-full ${pct === 100 ? 'bg-accent' : 'bg-accent/70'}`}
                initial={false}
                animate={{ width: `${pct}%` }}
              />
            </span>
            <span className="text-[9px] tabular-nums text-muted">{pct}%</span>
          </button>
        )
      })}
    </div>
  )
}

/** 'Block 3 — Graphs I …' → 'B3' · 'Phase 4 — Interview Loops' → 'P4' */
function shortLabel(title: string, index: number) {
  const m = title.match(/^(Block|Phase|Part)\s+(\d+)/i)
  if (m) return `${m[1][0].toUpperCase()}${m[2]}`
  return String(index + 1)
}
