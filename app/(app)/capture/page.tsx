import { createClient } from '@/lib/supabase/server'
import { istDateKey, istDisplayDate } from '@/lib/date'
import { CaptureForm } from '@/components/capture/CaptureForm'
import { EnableReminders } from '@/components/push/EnableReminders'

/** F7 — the 10 PM "close out the day" screen; deep-linked from the push/email.
 *  Prefills anything already logged today so the submit never clobbers. */
export default async function CapturePage() {
  const supabase = await createClient()
  const today = istDateKey()

  const [{ data: study }, { data: log }] = await Promise.all([
    supabase.from('tracks').select('id').eq('slug', 'study').single(),
    supabase
      .from('daily_logs')
      .select('rating, diet_satisfaction, diary')
      .eq('log_date', today)
      .maybeSingle(),
  ])

  const { data: hoursRow } = study
    ? await supabase
        .from('track_hours')
        .select('hours')
        .eq('track_id', study.id)
        .eq('log_date', today)
        .maybeSingle()
    : { data: null }

  if (!study) {
    return (
      <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
        Study track not found — check the seed.
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight">Close out the day</h1>
        <p className="mt-0.5 font-mono text-sm text-muted">☾ {istDisplayDate()}</p>
      </div>
      <CaptureForm
        studyTrackId={study.id}
        initial={{
          rating: log?.rating ?? null,
          dietSatisfaction: log?.diet_satisfaction ?? null,
          diary: log?.diary ?? null,
          studyHours: Number(hoursRow?.hours ?? 0),
        }}
      />
      <div className="mt-5">
        <EnableReminders />
      </div>
    </div>
  )
}
