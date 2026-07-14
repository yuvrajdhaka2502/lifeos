'use client'
import type { CompletionMap } from '@/lib/query/hooks/useCompletions'
import { ChecklistItem } from './ChecklistItem'
import { ChecklistSection } from './ChecklistSection'
import type { ItemData, PhaseData } from './types'

type Props = {
  phase: PhaseData
  completions: CompletionMap
  onToggle: (item: ItemData, next: { completed: boolean; count: number }) => void
  highlightSection?: (title: string) => boolean
  renderExtra?: (item: ItemData) => React.ReactNode
}

/** One phase's content: sectionless items first, then each section as an
 *  accordion. Shared by phase pages, pinned panels and Gym/Diet panels. */
export function PhaseChecklist({ phase, completions, onToggle, highlightSection, renderExtra }: Props) {
  const loose = phase.items.filter((i) => !i.section_id)
  return (
    <div className="space-y-3">
      {loose.length > 0 && (
        <div className="rounded-2xl border border-border bg-card px-2 py-2">
          {loose.map((item) => (
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
      )}
      {phase.sections.map((s) => (
        <ChecklistSection
          key={s.id}
          title={s.title}
          items={phase.items.filter((i) => i.section_id === s.id)}
          completions={completions}
          onToggle={onToggle}
          highlight={highlightSection?.(s.title) ?? false}
          renderExtra={renderExtra}
        />
      ))}
    </div>
  )
}
