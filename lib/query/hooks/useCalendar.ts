'use client'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { istWeekKey } from '@/lib/date'
import { qk } from '../keys'

/** date key → rating (1–5) for one month. Missing key = unlogged day. */
export type MonthRatings = Record<string, number | null>

function nextMonthStart(monthKey: string) {
  const [y, m] = monthKey.split('-').map(Number)
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
}

/** The month's daily_logs ratings for the calendar heatmap (F2). */
export function useCalendar(monthKey: string, initialData?: MonthRatings) {
  const supabase = createClient()
  return useQuery({
    queryKey: qk.calendar(monthKey),
    initialData,
    queryFn: async (): Promise<MonthRatings> => {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('log_date, rating')
        .gte('log_date', `${monthKey}-01`)
        .lt('log_date', nextMonthStart(monthKey))
      if (error) throw error
      const map: MonthRatings = {}
      for (const r of data) map[r.log_date] = r.rating
      return map
    },
  })
}

/** Mean rating over this IST week's rated days (F2's "wk avg" pill). */
export function useWeekAverage() {
  const supabase = createClient()
  const week = istWeekKey()
  return useQuery({
    queryKey: ['week_avg', week],
    queryFn: async (): Promise<number | null> => {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('rating')
        .gte('log_date', week)
        .not('rating', 'is', null)
      if (error) throw error
      if (!data.length) return null
      return data.reduce((s, r) => s + (r.rating ?? 0), 0) / data.length
    },
  })
}

/** Read-only hours logged on a given date (context in the day-detail sheet). */
export function useDayHours(dateKey: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['day_hours', dateKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('track_hours')
        .select('hours, tracks(name)')
        .eq('log_date', dateKey)
      if (error) throw error
      return data.map((r) => ({ name: (r.tracks as unknown as { name: string })?.name ?? '?', hours: Number(r.hours) }))
    },
  })
}
