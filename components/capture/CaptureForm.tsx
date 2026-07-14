'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Minus, Plus, Star } from 'lucide-react'
import { saveDay } from '@/app/(app)/capture/actions'

const FACES = [
  { value: 1, label: '😞', hint: 'junk / skipped' },
  { value: 2, label: '😐', hint: 'minor deviation' },
  { value: 3, label: '😀', hint: 'ideal' },
] as const

type Props = {
  studyTrackId: string
  initial: {
    rating: number | null
    dietSatisfaction: number | null
    diary: string | null
    studyHours: number
  }
}

/** F7 — the "close out the day" sheet (doc 04 §5.5): stars → diet faces →
 *  Study hours stepper → diary → one big Save. Everything optional; fields
 *  prefill from anything already logged today, and the submit writes exactly
 *  what's shown. Deep-link target of the 10 PM push (/capture). */
export function CaptureForm({ studyTrackId, initial }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [rating, setRating] = useState(initial.rating)
  const [satisfaction, setSatisfaction] = useState(initial.dietSatisfaction)
  const [hours, setHours] = useState(initial.studyHours)
  const [diary, setDiary] = useState(initial.diary ?? '')
  const [error, setError] = useState<string | null>(null)

  const submit = () =>
    startTransition(async () => {
      try {
        await saveDay({
          rating,
          diary: diary.trim() || null,
          dietSatisfaction: satisfaction,
          studyHours: hours,
          studyTrackId,
        })
        router.push('/')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed — try again')
      }
    })

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-border bg-card p-4">
        <p className="mb-2 text-sm text-muted">How was the day?</p>
        <div className="flex justify-between" role="radiogroup" aria-label="day rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <motion.button
              key={n}
              type="button"
              whileTap={{ scale: 0.8 }}
              onClick={() => setRating(rating === n ? null : n)}
              aria-label={`${n} stars`}
              className="p-1.5"
            >
              <Star
                className={`h-8 w-8 transition ${
                  rating != null && n <= rating
                    ? 'fill-accent stroke-accent'
                    : 'stroke-border hover:stroke-accent'
                }`}
              />
            </motion.button>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-between rounded-3xl border border-border bg-card p-4">
        <p className="text-sm text-muted">Diet today</p>
        <div className="flex gap-1.5">
          {FACES.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setSatisfaction(satisfaction === f.value ? null : f.value)}
              aria-label={`diet ${f.value} — ${f.hint}`}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border text-lg transition ${
                satisfaction === f.value
                  ? 'border-accent bg-accent/15'
                  : 'border-border opacity-60 hover:border-accent/50 hover:opacity-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-between rounded-3xl border border-border bg-card p-4">
        <p className="text-sm text-muted">Study hours</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHours((h) => Math.max(0, Math.round((h - 0.5) * 2) / 2))}
            aria-label="minus 30 minutes"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition hover:border-accent hover:text-accent"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[4rem] text-center font-mono text-xl font-semibold tabular-nums">
            {hours.toFixed(1)}h
          </span>
          <button
            type="button"
            onClick={() => setHours((h) => Math.round((h + 0.5) * 2) / 2)}
            aria-label="plus 30 minutes"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition hover:border-accent hover:text-accent"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-4">
        <p className="mb-2 text-sm text-muted">Diary</p>
        <textarea
          value={diary}
          onChange={(e) => setDiary(e.target.value)}
          rows={5}
          placeholder="Anything worth remembering?"
          className="w-full resize-y rounded-2xl border border-border bg-background p-3 text-sm leading-relaxed outline-none transition focus:border-accent"
        />
      </section>

      {error && (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>
      )}

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={submit}
        disabled={pending}
        className="w-full rounded-2xl bg-accent py-3.5 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save day'}
      </motion.button>
    </div>
  )
}
