'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { istDateKey, istWeekKey } from '@/lib/date'
import { qk } from '../keys'

type HoursRow = { log_date: string; hours: number }
export type HoursData = { today: number; weekTotal: number; rows: HoursRow[] }

/** Today's hours + this week's Σ for an hours-enabled track (F4a). */
export function useHours(trackId: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: qk.hours(trackId),
    queryFn: async (): Promise<HoursData> => {
      const { data, error } = await supabase
        .from('track_hours')
        .select('log_date, hours')
        .eq('track_id', trackId)
        .gte('log_date', istWeekKey())
        .order('log_date')
      if (error) throw error
      const rows = (data ?? []) as HoursRow[]
      const today = rows.find((r) => r.log_date === istDateKey())?.hours ?? 0
      const weekTotal = rows.reduce((s, r) => s + Number(r.hours), 0)
      return { today: Number(today), weekTotal, rows }
    },
  })
}

/** Optimistic upsert of today's hours on (track_id, log_date). */
export function useSetHours(trackId: string) {
  const supabase = createClient()
  const qc = useQueryClient()
  const key = qk.hours(trackId)

  return useMutation({
    mutationFn: async (hours: number) => {
      const { error } = await supabase
        .from('track_hours')
        .upsert({ track_id: trackId, log_date: istDateKey(), hours }, { onConflict: 'track_id,log_date' })
      if (error) throw error
    },
    onMutate: async (hours) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<HoursData>(key)
      if (prev) {
        const delta = hours - prev.today
        qc.setQueryData<HoursData>(key, { ...prev, today: hours, weekTotal: prev.weekTotal + delta })
      }
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}
