'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { qk } from '../keys'

export type DailyLog = { rating: number | null; diet_satisfaction: number | null; diary: string | null }

/** The day's log row (rating + diet satisfaction + diary); null fields when unlogged. */
export function useDailyLog(dateKey: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: qk.dailyLog(dateKey),
    queryFn: async (): Promise<DailyLog> => {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('rating, diet_satisfaction, diary')
        .eq('log_date', dateKey)
        .maybeSingle()
      if (error) throw error
      return data ?? { rating: null, diet_satisfaction: null, diary: null }
    },
  })
}

/** Optimistic upsert of the day's star rating (1–5, F5). */
export function useSetRating(dateKey: string) {
  const supabase = createClient()
  const qc = useQueryClient()
  const key = qk.dailyLog(dateKey)

  return useMutation({
    mutationFn: async (value: number) => {
      const { error } = await supabase
        .from('daily_logs')
        .upsert({ log_date: dateKey, rating: value }, { onConflict: 'user_id,log_date' })
      if (error) throw error
    },
    onMutate: async (value) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<DailyLog>(key)
      qc.setQueryData<DailyLog>(key, (d) => ({
        rating: value,
        diary: d?.diary ?? null,
        diet_satisfaction: d?.diet_satisfaction ?? null,
      }))
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}

/** Optimistic upsert of the day's diary text (F6) — called debounced (autosave). */
export function useSetDiary(dateKey: string) {
  const supabase = createClient()
  const qc = useQueryClient()
  const key = qk.dailyLog(dateKey)

  return useMutation({
    mutationFn: async (diary: string) => {
      const { error } = await supabase
        .from('daily_logs')
        .upsert({ log_date: dateKey, diary: diary || null }, { onConflict: 'user_id,log_date' })
      if (error) throw error
    },
    onMutate: async (diary) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<DailyLog>(key)
      qc.setQueryData<DailyLog>(key, (d) => ({
        rating: d?.rating ?? null,
        diet_satisfaction: d?.diet_satisfaction ?? null,
        diary: diary || null,
      }))
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}

/** Optimistic upsert of the day's diet satisfaction (1–3, F4c). */
export function useSetDietSatisfaction(dateKey: string) {
  const supabase = createClient()
  const qc = useQueryClient()
  const key = qk.dailyLog(dateKey)

  return useMutation({
    mutationFn: async (value: number) => {
      const { error } = await supabase
        .from('daily_logs')
        .upsert({ log_date: dateKey, diet_satisfaction: value }, { onConflict: 'user_id,log_date' })
      if (error) throw error
    },
    onMutate: async (value) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<DailyLog>(key)
      qc.setQueryData<DailyLog>(key, (d) => ({
        rating: d?.rating ?? null,
        diary: d?.diary ?? null,
        diet_satisfaction: value,
      }))
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}
