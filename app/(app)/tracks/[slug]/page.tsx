import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PanelsTrackPage } from '@/components/tracks/PanelsTrackPage'
import { PhasedTrackPage } from '@/components/tracks/PhasedTrackPage'
import type { PhaseData } from '@/components/tracks/types'

/** F4 — track page. Structure (track → phases → sections → items) is fetched
 *  server-side under RLS; period-keyed completions are client-side (TanStack
 *  Query, optimistic). Renders by track.layout: 'phased' (Study) | 'panels'
 *  (Gym, Diet). */
export default async function TrackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: track } = await supabase
    .from('tracks')
    .select('id, slug, name, layout, tracks_hours, icon, color, accent')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  if (!track) notFound()

  const [{ data: phases }, { data: sections }, { data: items }] = await Promise.all([
    supabase
      .from('track_phases')
      .select('id, title, subtitle, layout, period_scope, sort_order')
      .eq('track_id', track.id)
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('track_sections')
      .select('id, phase_id, title, sort_order')
      .eq('track_id', track.id)
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('track_items')
      .select('id, phase_id, section_id, title, note, sets, reps, weight, weekly_target, sort_order')
      .eq('track_id', track.id)
      .eq('is_active', true)
      .order('sort_order'),
  ])

  const phaseData: PhaseData[] = (phases ?? []).map((p) => ({
    ...p,
    sections: (sections ?? []).filter((s) => s.phase_id === p.id),
    items: (items ?? []).filter((i) => i.phase_id === p.id),
  }))

  return track.layout === 'phased' ? (
    <PhasedTrackPage track={track} phases={phaseData} />
  ) : (
    <PanelsTrackPage track={track} phases={phaseData} />
  )
}
