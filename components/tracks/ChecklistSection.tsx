'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { CompletionMap } from '@/lib/query/hooks/useCompletions'
import { ChecklistItem } from './ChecklistItem'
import type { ItemData } from './types'

const URL_RE = /https?:\/\/[^\s)]+/

type Props = {
  title: string
  items: ItemData[]
  completions: CompletionMap
  onToggle: (item: ItemData, next: { completed: boolean; count: number }) => void
  highlight?: boolean
  defaultOpen?: boolean
  renderExtra?: (item: ItemData) => React.ReactNode
}

/** Collapsible section accordion with its own mini progress (doc 04 §5.2). */
export function ChecklistSection({
  title,
  items,
  completions,
  onToggle,
  highlight,
  defaultOpen = true,
  renderExtra,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const done = items.filter((i) => completions[i.id]?.completed).length
  const cleanTitle = title.replace(URL_RE, '').replace(/\(\s*\)/, '').trim()

  return (
    <div
      className={`rounded-2xl border transition ${
        highlight ? 'border-accent/50 bg-accent/[0.04]' : 'border-border bg-card'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium">{cleanTitle}</span>
          {highlight && (
            <span className="rounded-full bg-accent/20 px-2 py-px text-[10px] font-medium uppercase tracking-wide text-accent">
              today
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-xs tabular-nums text-muted">
            {done}/{items.length}
          </span>
          <span className="h-1 w-14 overflow-hidden rounded-full bg-border">
            <motion.span
              className="block h-full rounded-full bg-accent"
              initial={false}
              animate={{ width: items.length ? `${(done / items.length) * 100}%` : '0%' }}
              transition={{ type: 'spring', stiffness: 160, damping: 24 }}
            />
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
            <div className="border-t border-border px-2 py-2">
              {items.map((item) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  completed={completions[item.id]?.completed ?? false}
                  count={completions[item.id]?.count ?? 0}
                  onToggle={(next) => onToggle(item, next)}
                  renderExtra={renderExtra}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
