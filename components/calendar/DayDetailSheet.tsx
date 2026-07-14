'use client'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { useDayHours } from '@/lib/query/hooks/useCalendar'
import {
  useDailyLog,
  useSetDiary,
  useSetDietSatisfaction,
  useSetRating,
} from '@/lib/query/hooks/useDailyLog'

const FACES = [
  { value: 1, label: '😞', hint: 'junk / skipped' },
  { value: 2, label: '😐', hint: 'minor deviation' },
  { value: 3, label: '😀', hint: 'ideal' },
] as const

/** F2 — the tapped day's detail: rating + diet score + diary all editable
 *  (past days included, PRD F5/F6); logged hours shown read-only. */
export function DayDetailSheet({ dateKey, onClose }: { dateKey: string; onClose: () => void }) {
  const { data: log, isSuccess } = useDailyLog(dateKey)
  const { data: hours = [] } = useDayHours(dateKey)
  const setRating = useSetRating(dateKey)
  const setSatisfaction = useSetDietSatisfaction(dateKey)

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60"
      />
      <motion.div
        key="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-3xl border border-b-0 border-border bg-card p-5 pb-8"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-sm font-semibold tabular-nums">{dateKey}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition hover:border-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Day rating</span>
            <div className="flex gap-0.5" role="radiogroup" aria-label="day rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <motion.button
                  key={n}
                  type="button"
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setRating.mutate(n)}
                  aria-label={`${n} stars`}
                  className="p-1"
                >
                  <Star
                    className={`h-6 w-6 transition ${
                      log?.rating != null && n <= log.rating
                        ? 'fill-accent stroke-accent'
                        : 'stroke-border hover:stroke-accent'
                    }`}
                  />
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Diet</span>
            <div className="flex gap-1.5">
              {FACES.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setSatisfaction.mutate(f.value)}
                  aria-label={`diet ${f.value} — ${f.hint}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border text-base transition ${
                    log?.diet_satisfaction === f.value
                      ? 'border-accent bg-accent/15'
                      : 'border-border opacity-60 hover:border-accent/50 hover:opacity-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {hours.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Hours logged</span>
              <span className="font-mono text-sm tabular-nums">
                {hours.map((h) => `${h.name} ${h.hours.toFixed(1)}h`).join(' · ')}
              </span>
            </div>
          )}

          {isSuccess && <DiaryField key={dateKey} dateKey={dateKey} initial={log.diary ?? ''} />}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/** Debounced diary autosave (F6). Keyed by date so state resets per day. */
export function DiaryField({
  dateKey,
  initial,
  rows = 4,
}: {
  dateKey: string
  initial: string
  rows?: number
}) {
  const [text, setText] = useState(initial)
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const setDiary = useSetDiary(dateKey)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const queue = (value: string) => {
    setText(value)
    setState('saving')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setDiary.mutate(value, { onSuccess: () => setState('saved'), onError: () => setState('idle') })
    }, 800)
  }
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm text-muted">Diary</span>
        <span className="text-[10px] uppercase tracking-wide text-muted">
          {state === 'saving' ? 'saving…' : state === 'saved' ? 'saved' : ''}
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => queue(e.target.value)}
        rows={rows}
        placeholder="How did the day go?"
        className="w-full resize-y rounded-2xl border border-border bg-background p-3 text-sm leading-relaxed outline-none transition focus:border-accent"
      />
    </div>
  )
}
