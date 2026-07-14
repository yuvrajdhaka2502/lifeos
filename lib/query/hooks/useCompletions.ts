'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { qk } from '../keys'

/** item_id → its completion state for one (track, period). Missing key = unchecked. */
export type CompletionMap = Record<string, { completed: boolean; count: number }>

/** All completions for a track in one period — feeds the stepper %, phase pages,
 *  pinned panels and the weekly "last week" score from a single cache entry. */
export function useCompletions(trackId: string, period: string, enabled = true) {
  const supabase = createClient()
  return useQuery({
    enabled,
    queryKey: qk.completions(trackId, period),
    queryFn: async (): Promise<CompletionMap> => {
      const { data, error } = await supabase
        .from('item_completions')
        .select('item_id, completed, completed_count')
        .eq('track_id', trackId)
        .eq('period_key', period)
      if (error) throw error
      const map: CompletionMap = {}
      for (const r of data) map[r.item_id] = { completed: r.completed, count: r.completed_count }
      return map
    },
  })
}

/** Optimistic toggle (F4). Upsert on (item_id, period_key) — idempotent. */
export function useToggleItem(trackId: string, period: string) {
  const supabase = createClient()
  const qc = useQueryClient()
  const key = qk.completions(trackId, period)

  return useMutation({
    mutationFn: async (v: { itemId: string; phaseId: string; completed: boolean; count: number }) => {
      const { error } = await supabase.from('item_completions').upsert(
        {
          item_id: v.itemId,
          track_id: trackId,
          phase_id: v.phaseId,
          period_key: period,
          completed: v.completed,
          completed_count: v.count,
        },
        { onConflict: 'item_id,period_key' },
      )
      if (error) throw error
    },
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<CompletionMap>(key)
      qc.setQueryData<CompletionMap>(key, (m) => ({
        ...(m ?? {}),
        [v.itemId]: { completed: v.completed, count: v.count },
      }))
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}
