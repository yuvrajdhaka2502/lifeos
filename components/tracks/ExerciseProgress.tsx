'use client'
import { useState } from 'react'
import { Check, Pencil } from 'lucide-react'
import { useGymProgress, type GymProgress } from '@/lib/query/hooks/useGymProgress'
import type { ItemData } from './types'

/** F4b — inline per-exercise progress (last session's sets / reps / weight).
 *  Persistent item state on track_items: survives the Monday weekly refresh,
 *  changes only when edited here. Un-set fields render as "—", never 0. */
export function ExerciseProgress({ item }: { item: ItemData }) {
  const mutation = useGymProgress()
  const [value, setValue] = useState<GymProgress>({ sets: item.sets, reps: item.reps, weight: item.weight })
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<GymProgress>(value)

  const save = () => {
    const prev = value
    setValue(draft) // optimistic
    setEditing(false)
    mutation.mutate(
      { itemId: item.id, ...draft },
      { onError: () => setValue(prev) },
    )
  }

  if (editing) {
    return (
      <div className="mt-1 flex flex-wrap items-center gap-2 rounded-lg border border-accent/40 bg-accent/[0.06] px-2 py-1.5">
        <label className="flex items-center gap-1 text-[11px] text-muted">
          sets
          <input
            type="number"
            min={0}
            value={draft.sets ?? ''}
            onChange={(e) => setDraft({ ...draft, sets: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) })}
            className="w-12 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-xs tabular-nums text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex items-center gap-1 text-[11px] text-muted">
          reps
          <input
            type="number"
            min={0}
            value={draft.reps ?? ''}
            onChange={(e) => setDraft({ ...draft, reps: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) })}
            className="w-12 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-xs tabular-nums text-foreground outline-none focus:border-accent"
          />
        </label>
        <label className="flex items-center gap-1 text-[11px] text-muted">
          weight
          <input
            type="text"
            placeholder="60kg / BW+10kg"
            value={draft.weight ?? ''}
            onChange={(e) => setDraft({ ...draft, weight: e.target.value === '' ? null : e.target.value })}
            className="w-28 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-xs text-foreground outline-none focus:border-accent"
          />
        </label>
        <button
          type="button"
          onClick={save}
          className="ml-auto flex h-6 w-6 items-center justify-center rounded-md bg-accent text-background transition hover:opacity-90"
          aria-label="save progress"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  const empty = value.sets == null && value.reps == null && value.weight == null
  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value)
        setEditing(true)
      }}
      className="mt-1 flex items-center gap-1.5 rounded-lg px-2 py-0.5 font-mono text-[11px] tabular-nums text-muted transition hover:bg-white/[0.04] hover:text-foreground"
    >
      <span>
        last:{' '}
        {empty ? (
          <span className="text-muted/60">—</span>
        ) : (
          <>
            {value.sets ?? '—'}×{value.reps ?? '—'} · {value.weight ?? '—'}
          </>
        )}
      </span>
      <Pencil className="h-2.5 w-2.5" />
    </button>
  )
}
