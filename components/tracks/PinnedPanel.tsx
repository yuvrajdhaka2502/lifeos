'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Pin } from 'lucide-react'
import type { CompletionMap } from '@/lib/query/hooks/useCompletions'
import { PhaseChecklist } from './PhaseChecklist'
import type { ItemData, PhaseData } from './types'

type Props = {
  phase: PhaseData
  completions: CompletionMap
  onToggle: (item: ItemData, next: { completed: boolean; count: number }) => void
}

/** An always-visible pinned panel (DSA Maintenance / Projects): persists across
 *  phase navigation; collapsible so it stays out of the way on phone. */
export function PinnedPanel({ phase, completions, onToggle }: Props) {
  const [open, setOpen] = useState(false)
  const total = phase.items.length
  const done = phase.items.filter((i) => completions[i.id]?.completed).length

  return (
    <div className="rounded-2xl border border-border bg-card/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Pin className="h-3.5 w-3.5 shrink-0 text-accent" />
          <span className="truncate text-sm font-medium">{phase.title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-xs tabular-nums text-muted">
            {done}/{total}
          </span>
          <ChevronDown className={`h-4 w-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-border p-3">
              {phase.subtitle && <p className="px-1 text-xs text-muted">{phase.subtitle}</p>}
              <PhaseChecklist phase={phase} completions={completions} onToggle={onToggle} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
