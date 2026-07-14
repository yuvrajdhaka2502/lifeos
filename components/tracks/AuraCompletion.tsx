'use client'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { CompletionMap } from '@/lib/query/hooks/useCompletions'
import type { PhaseData } from './types'

export type Aura = { key: number; label: string }

/** Watches a completions map and fires once when a section or phase *crosses*
 *  to 100% (doc 04 §3 — the "Aura" moment). Never fires on initial load: the
 *  first ready snapshot only seeds the baseline. Phase completion outranks the
 *  section completion that caused it. */
export function useAuraTrigger(phases: PhaseData[], completions: CompletionMap, ready: boolean) {
  const [aura, setAura] = useState<Aura | null>(null)
  const seen = useRef<{ sections: Set<string>; phases: Set<string> } | null>(null)

  useEffect(() => {
    if (!ready) return
    const doneSections = new Set<string>()
    const donePhases = new Set<string>()
    const sectionTitles = new Map<string, string>()

    for (const phase of phases) {
      if (phase.items.length > 0 && phase.items.every((i) => completions[i.id]?.completed)) {
        donePhases.add(phase.id)
      }
      for (const s of phase.sections) {
        const items = phase.items.filter((i) => i.section_id === s.id)
        if (items.length > 0 && items.every((i) => completions[i.id]?.completed)) {
          doneSections.add(s.id)
          sectionTitles.set(s.id, s.title)
        }
      }
    }

    if (seen.current) {
      const newPhase = phases.find((p) => donePhases.has(p.id) && !seen.current!.phases.has(p.id))
      const newSection = [...doneSections].find((id) => !seen.current!.sections.has(id))
      if (newPhase) {
        setAura({ key: Date.now(), label: `${newPhase.title} complete · 100%` })
      } else if (newSection) {
        setAura({ key: Date.now(), label: `${sectionTitles.get(newSection)} complete` })
      }
    }
    seen.current = { sections: doneSections, phases: donePhases }
  }, [phases, completions, ready])

  return { aura, dismiss: () => setAura(null) }
}

/** The effect itself (doc 04 §3): a radial accent bloom behind the card, one
 *  diagonal light-sweep, and a glass toast with slow lime motes. Under
 *  prefers-reduced-motion everything collapses to a fading toast. Render the
 *  overlay inside a `relative` container; the toast positions itself fixed. */
export function AuraCompletion({
  aura,
  onDone,
  accent = '#6d5efc',
}: {
  aura: Aura | null
  onDone: () => void
  accent?: string
}) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!aura) return
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [aura, onDone])

  return (
    <>
      {/* bloom + light sweep, over the card (skipped under reduced motion) */}
      <AnimatePresence>
        {aura && !reduced && (
          <motion.div
            key={aura.key}
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse at 50% 45%, ${accent}55, transparent 70%)` }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: [0, 1, 0], scale: 1.15 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-y-0 w-1/3 -skew-x-12"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent)' }}
              initial={{ x: '-150%' }}
              animate={{ x: '400%' }}
              transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.15 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* glass toast (always shown; reduced motion = opacity-only) */}
      <AnimatePresence>
        {aura && (
          <motion.div
            key={aura.key}
            className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card/80 px-5 py-3 shadow-2xl backdrop-blur-md">
              <p className="text-sm font-medium">{aura.label}</p>
              <span
                className="absolute inset-x-4 bottom-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
              />
              {!reduced && (
                <>
                  <motion.span
                    className="absolute right-3 top-2 h-1 w-1 rounded-full bg-[#C6F432]"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: [0, 1, 0], y: -6 }}
                    transition={{ duration: 2, delay: 0.3 }}
                  />
                  <motion.span
                    className="absolute right-7 top-4 h-[3px] w-[3px] rounded-full bg-[#C6F432]/70"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: [0, 1, 0], y: -8 }}
                    transition={{ duration: 2.3, delay: 0.6 }}
                  />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
