'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { istDateKey } from '@/lib/date'

/** F7 — one submit writes the whole day (doc 07 §6.3, single Study hours):
 *  daily_logs (rating + diary + diet satisfaction) and the Study track_hours
 *  row, both upserted for today (IST). All fields optional; hours default 0. */
export async function saveDay(input: {
  rating: number | null
  diary: string | null
  dietSatisfaction: number | null
  studyHours: number
  studyTrackId: string
}) {
  const supabase = await createClient()
  const today = istDateKey()

  const { error: logError } = await supabase.from('daily_logs').upsert(
    {
      log_date: today,
      rating: input.rating,
      diary: input.diary,
      diet_satisfaction: input.dietSatisfaction,
    },
    { onConflict: 'user_id,log_date' },
  )
  if (logError) throw new Error(logError.message)

  const { error: hoursError } = await supabase.from('track_hours').upsert(
    { track_id: input.studyTrackId, log_date: today, hours: input.studyHours },
    { onConflict: 'track_id,log_date' },
  )
  if (hoursError) throw new Error(hoursError.message)

  revalidatePath('/')
}
