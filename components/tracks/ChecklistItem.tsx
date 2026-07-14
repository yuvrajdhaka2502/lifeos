'use client'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import type { ItemData } from './types'

const URL_RE = /https?:\/\/[^\s)]+/

/** Seed convention (doc 06): the first inline URL in a title becomes a tappable
 *  resource chip; the visible title is the text without it. */
function splitTitle(title: string) {
  const m = title.match(URL_RE)
  if (!m) return { text: title, url: null as string | null }
  const text = title
    .replace(m[0], '')
    .replace(/\(\s*\)/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
  return { text, url: m[0] }
}

function chipLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'link'
  }
}

type Props = {
  item: ItemData
  completed: boolean
  count: number
  onToggle: (next: { completed: boolean; count: number }) => void
  /** Extra row under the item — e.g. the gym sets/reps/weight editor (F4b). */
  renderExtra?: (item: ItemData) => React.ReactNode
}

export function ChecklistItem({ item, completed, count, onToggle, renderExtra }: Props) {
  const { text, url } = splitTitle(item.title)
  const multi = item.weekly_target > 1

  const handleTap = () => {
    if (!multi) {
      onToggle({ completed: !completed, count: completed ? 0 : 1 })
      return
    }
    // multi-count (weekly_target > 1): each tap +1; at target the next tap resets
    const next = count >= item.weekly_target ? 0 : count + 1
    onToggle({ completed: next >= item.weekly_target, count: next })
  }

  return (
    <div className="group flex items-start gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.03]">
      <motion.button
        type="button"
        onClick={handleTap}
        whileTap={{ scale: 0.85 }}
        aria-pressed={completed}
        className={`relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
          completed
            ? 'border-accent bg-accent/90'
            : multi && count > 0
              ? 'border-accent/70 bg-accent/20'
              : 'border-border bg-transparent group-hover:border-accent/50'
        }`}
      >
        {completed && (
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0a0a0f"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <motion.path
              d="M4 12l5 5L20 6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </motion.svg>
        )}
      </motion.button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <button
            type="button"
            onClick={handleTap}
            className={`text-left text-sm leading-snug transition ${
              completed ? 'text-muted line-through decoration-border' : 'text-foreground'
            }`}
          >
            {text}
          </button>
          {multi && (
            <span
              className={`rounded-full border px-1.5 py-px font-mono text-[10px] tabular-nums ${
                completed ? 'border-accent/60 text-accent' : 'border-border text-muted'
              }`}
            >
              {count}/{item.weekly_target}
            </span>
          )}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-px font-mono text-[10px] text-muted transition hover:border-accent hover:text-accent"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              {chipLabel(url)}
            </a>
          )}
        </div>
        {item.note && <p className="mt-0.5 text-xs text-muted">{item.note}</p>}
        {renderExtra?.(item)}
      </div>
    </div>
  )
}
