import { createClient } from '@/lib/supabase/server'
import {
  istDateKey,
  istDisplayDate,
  istHour,
  istLastNDates,
  istLastWeekKey,
  istMonthKey,
  istWeekKey,
} from '@/lib/date'
import { MiniCalendar } from '@/components/dashboard/MiniCalendar'
import { RateTodayBanner } from '@/components/dashboard/RateTodayBanner'
import { TrackTile, type TileData } from '@/components/dashboard/TrackTile'

/** Diet-satisfaction strip colors (1–3) — ends of the rating palette. */
const SATISFACTION_COLORS: Record<number, string> = { 1: '#EF4444', 2: '#EAB308', 3: '#22C55E' }
const SATISFACTION_LABELS: Record<number, string> = { 1: '😞 junk / skipped', 2: '😐 minor deviation', 3: '😀 ideal day' }

/** 'Block 3 — Graphs I …' → 'Block 3' (the tile's "current" label). */
const shortPhase = (title: string) => title.match(/^(Block|Phase|Part)\s+\d+/)?.[0] ?? title

/** F1 — the 4-tile dashboard (doc 04 §5.1): Study · Gym · Diet · To-Do, plus
 *  the Rate-today banner and the mini rating heatmap. All aggregates are
 *  computed server-side from five parallel queries. */
export default async function DashboardPage() {
  const supabase = await createClient()

  const today = istDateKey()
  const thisWeek = istWeekKey()
  const lastWeek = istLastWeekKey()
  const month = istMonthKey()
  const stripDates = istLastNDates(7)
  const logsFrom = stripDates[0] < `${month}-01` ? stripDates[0] : `${month}-01`

  const [
    { data: { user } },
    { data: tracks, error },
    { data: phases },
    { data: items },
    { data: completions },
    { data: hours },
    { data: logs },
    { data: todos },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('tracks')
      .select('id, slug, name, layout, tracks_hours, color, accent')
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('track_phases')
      .select('id, track_id, title, layout, period_scope, sort_order')
      .eq('is_active', true)
      .order('sort_order'),
    supabase.from('track_items').select('id, phase_id, track_id').eq('is_active', true),
    supabase
      .from('item_completions')
      .select('item_id, phase_id, track_id, completed, period_key')
      .in('period_key', [...new Set(['static', thisWeek, lastWeek, today])]),
    supabase.from('track_hours').select('track_id, log_date, hours').gte('log_date', thisWeek),
    supabase
      .from('daily_logs')
      .select('log_date, rating, diet_satisfaction')
      .gte('log_date', logsFrom),
    supabase.from('todos').select('id, urgency').eq('completed', false),
  ])

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
        Failed to load tracks: {error.message}
      </div>
    )
  }

  const doneSet = (period: string) =>
    new Set(
      (completions ?? []).filter((c) => c.period_key === period && c.completed).map((c) => c.item_id),
    )
  const staticDone = doneSet('static')
  const weekDone = doneSet(thisWeek)
  const lastWeekDone = doneSet(lastWeek)
  const todayDone = doneSet(today)

  const tiles: TileData[] = []
  for (const t of tracks ?? []) {
    const from = t.color ?? '#6366F1'
    const to = t.accent ?? '#8B5CF6'
    const tPhases = (phases ?? []).filter((p) => p.track_id === t.id)
    const itemsOf = (phaseIds: Set<string>) => (items ?? []).filter((i) => phaseIds.has(i.phase_id))

    if (t.layout === 'phased') {
      // Study — overall static progress over the navigable pages + current block + hours
      const nav = tPhases.filter((p) => p.layout === 'phase')
      const navIds = new Set(nav.map((p) => p.id))
      const navItems = itemsOf(navIds)
      const done = navItems.filter((i) => staticDone.has(i.id)).length
      const current =
        nav.find((p) => {
          const its = (items ?? []).filter((i) => i.phase_id === p.id)
          return its.some((i) => !staticDone.has(i.id))
        }) ?? nav[nav.length - 1]
      const tHours = (hours ?? []).filter((h) => h.track_id === t.id)
      const todayHours = Number(tHours.find((h) => h.log_date === today)?.hours ?? 0)
      const weekHours = tHours.reduce((s, h) => s + Number(h.hours), 0)

      tiles.push({
        href: `/tracks/${t.slug}`,
        name: t.name,
        from,
        to,
        pct: navItems.length ? (done / navItems.length) * 100 : 0,
        headline: current ? shortPhase(current.title) : '—',
        sub: `${done}/${navItems.length} done`,
        stats: t.tracks_hours
          ? [
              { label: 'today', value: `${todayHours.toFixed(1)}h` },
              { label: 'this wk', value: `Σ ${weekHours.toFixed(1)}h` },
            ]
          : undefined,
      })
    } else if (t.slug === 'gym') {
      // Gym — this week vs last week
      const panelIds = new Set(tPhases.filter((p) => p.layout === 'panel').map((p) => p.id))
      const gymItems = itemsOf(panelIds)
      const done = gymItems.filter((i) => weekDone.has(i.id)).length
      const last = gymItems.filter((i) => lastWeekDone.has(i.id)).length
      tiles.push({
        href: `/tracks/${t.slug}`,
        name: t.name,
        from,
        to,
        pct: gymItems.length ? (done / gymItems.length) * 100 : 0,
        headline: `${done}/${gymItems.length}`,
        sub: 'this week',
        stats: [{ label: 'last wk', value: String(last) }],
      })
    } else {
      // Diet — today's meals + satisfaction + 7-day strip
      const dailyIds = new Set(tPhases.filter((p) => p.period_scope === 'daily').map((p) => p.id))
      const meals = itemsOf(dailyIds)
      const done = meals.filter((i) => todayDone.has(i.id)).length
      const sat = (logs ?? []).find((l) => l.log_date === today)?.diet_satisfaction ?? null
      tiles.push({
        href: `/tracks/${t.slug}`,
        name: t.name,
        from,
        to,
        pct: meals.length ? (done / meals.length) * 100 : 0,
        headline: `${done}/${meals.length}`,
        sub: sat ? SATISFACTION_LABELS[sat] : 'meals today',
        strip: stripDates.map((d) => {
          const s = (logs ?? []).find((l) => l.log_date === d)?.diet_satisfaction
          return s ? SATISFACTION_COLORS[s] : null
        }),
      })
    }
  }

  // To-Do — the 4th tile (todos table; F3 page is a later step)
  const open = (todos ?? []).length
  const urgent = (todos ?? []).filter((td) => td.urgency === 'urgent').length
  tiles.push({
    href: '/todos',
    name: 'To-Do',
    from: '#E879F9',
    to: '#FB7185',
    pct: open === 0 ? 100 : 0,
    ringLabel: String(open),
    headline: `${open} open`,
    sub: `${urgent} urgent`,
  })

  // Rate-today banner + calendar props
  const todayLog = (logs ?? []).find((l) => l.log_date === today)
  const weekRatings = (logs ?? []).filter((l) => l.log_date >= thisWeek && l.rating != null)
  const weeklyAvg = weekRatings.length
    ? weekRatings.reduce((s, l) => s + (l.rating ?? 0), 0) / weekRatings.length
    : null
  const monthRatings = Object.fromEntries(
    (logs ?? []).filter((l) => l.log_date.startsWith(month)).map((l) => [l.log_date, l.rating]),
  )

  const hour = istHour()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const name = user?.email?.split('@')[0] ?? 'there'

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting}, {name}
        </h1>
        <span className="shrink-0 font-mono text-sm text-muted">☾ {istDisplayDate()}</span>
      </div>

      <RateTodayBanner
        initialLog={{
          rating: todayLog?.rating ?? null,
          diet_satisfaction: todayLog?.diet_satisfaction ?? null,
          diary: null,
        }}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {tiles.map((tile) => (
          <TrackTile key={tile.href} tile={tile} />
        ))}
      </div>

      <div className="mt-6">
        <MiniCalendar initialMonth={month} initialRatings={monthRatings} weeklyAvg={weeklyAvg} />
      </div>
    </div>
  )
}
