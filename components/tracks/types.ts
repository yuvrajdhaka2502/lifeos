import type { Database } from '@/lib/types'

export type PhaseLayout = Database['public']['Enums']['phase_layout']
export type PeriodScope = Database['public']['Enums']['period_scope']

export type TrackInfo = {
  id: string
  slug: string
  name: string
  layout: Database['public']['Enums']['track_layout']
  tracks_hours: boolean
  icon: string | null
  color: string | null
  accent: string | null
}

export type SectionData = {
  id: string
  phase_id: string
  title: string
  sort_order: number
}

export type ItemData = {
  id: string
  phase_id: string
  section_id: string | null
  title: string
  note: string | null
  sets: number | null
  reps: number | null
  weight: string | null
  weekly_target: number
  sort_order: number
}

/** A phase with its sections + items nested (structure fetched server-side;
 *  completions are period-keyed and fetched client-side). */
export type PhaseData = {
  id: string
  title: string
  subtitle: string | null
  layout: PhaseLayout
  period_scope: PeriodScope
  sort_order: number
  sections: SectionData[]
  items: ItemData[]
}
