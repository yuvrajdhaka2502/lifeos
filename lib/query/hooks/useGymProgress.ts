'use client'
import { useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export type GymProgress = { sets: number | null; reps: number | null; weight: string | null }

/** Gym progress edit (F4b). Writes track_items — NOT item_completions — which is
 *  structurally why the Monday weekly refresh never touches these values. */
export function useGymProgress() {
  const supabase = createClient()
  return useMutation({
    mutationFn: async (v: { itemId: string } & GymProgress) => {
      const { error } = await supabase
        .from('track_items')
        .update({ sets: v.sets, reps: v.reps, weight: v.weight })
        .eq('id', v.itemId)
      if (error) throw error
    },
  })
}
