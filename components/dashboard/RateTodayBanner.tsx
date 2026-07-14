'use client'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { istDateKey } from '@/lib/date'
import { useDailyLog, useSetRating, type DailyLog } from '@/lib/query/hooks/useDailyLog'

/** F1/F5 — "Rate today" call-to-action, shown only while today is unrated
 *  (PRD F1). Tapping a star writes daily_logs.rating optimistically; the
 *  banner then collapses. Server passes today's log to avoid a flash. */
export function RateTodayBanner({ initialLog }: { initialLog: DailyLog }) {
  const today = istDateKey()
  const { data = initialLog } = useDailyLog(today)
  const setRating = useSetRating(today)

  if (data.rating != null) return null

  return (
    <motion.div
      initial={false}
      exit={{ opacity: 0, height: 0 }}
      className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-accent/40 bg-accent/[0.07] px-4 py-3"
    >
      <div>
        <p className="text-sm font-medium">Rate today</p>
        <p className="text-xs text-muted">
          Tap a star, or do the{' '}
          <a href="/capture" className="text-accent underline-offset-2 hover:underline">
            full check-in →
          </a>
        </p>
      </div>
      <div className="flex gap-1" role="radiogroup" aria-label="today's rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            type="button"
            whileTap={{ scale: 0.8 }}
            onClick={() => setRating.mutate(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition hover:text-accent"
          >
            <Star className="h-5 w-5" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
