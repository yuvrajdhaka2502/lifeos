// LifeOS — evening reminder (the only scheduled job, doc 02 §5 / doc 07 §9).
// Invoked by pg_cron at 16:30 UTC (= 22:00 IST) via net.http_post with the
// CRON_SECRET bearer. Skips if today is already rated or already notified;
// sends Web Push to every stored subscription (pruning dead ones) and a
// backup email via Resend when a key is configured.
import webpush from 'npm:web-push@3'
import { Resend } from 'npm:resend@4'
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.headers.get('authorization') !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('unauthorized', { status: 401 })
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // IST "today" (UTC+5:30, no DST)
  const today = new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10)

  // smart suppression: skip if today is already rated
  const { data: log } = await admin.from('daily_logs').select('rating').eq('log_date', today).maybeSingle()
  if (log?.rating != null) return new Response('already logged')

  // guard against duplicate sends
  const { data: already } = await admin
    .from('notification_log')
    .select('id')
    .eq('kind', 'evening_reminder')
    .eq('sent_for_date', today)
    .maybeSingle()
  if (already) return new Response('already sent')

  const appUrl = Deno.env.get('APP_URL') ?? 'https://lifeos.vercel.app'
  const channels: string[] = []

  // Web Push (primary) — only when subscriptions and VAPID keys exist
  const { data: subs } = await admin.from('push_subscriptions').select('*')
  const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY')
  const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY')
  if ((subs?.length ?? 0) > 0 && vapidPublic && vapidPrivate) {
    webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT') ?? 'mailto:reminder@lifeos', vapidPublic, vapidPrivate)
    const payload = JSON.stringify({
      title: 'Rate your day',
      body: 'Log Study hours, diet & journal',
      url: `${appUrl}/capture`,
    })
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload)
        channels[0] = 'push'
      } catch (err) {
        const code = (err as { statusCode?: number }).statusCode
        if (code === 404 || code === 410) {
          await admin.from('push_subscriptions').delete().eq('id', s.id) // prune dead
        }
      }
    }
  }

  // Email (backup) — only when a Resend key is configured
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const to = (Deno.env.get('VAPID_SUBJECT') ?? '').replace('mailto:', '')
  if (resendKey && to) {
    try {
      await new Resend(resendKey).emails.send({
        from: 'LifeOS <onboarding@resend.dev>',
        to,
        subject: 'Close out your day',
        html: `<p>Rate the day, log Study hours, diet & journal.</p><p><a href="${appUrl}/capture">Open the check-in →</a></p>`,
      })
      channels.push('email')
    } catch {
      /* non-fatal — push is primary */
    }
  }

  // service role has no auth.uid(), so the user_id default won't fire — look up
  // the single profile and set it explicitly, and surface the error (supabase-js
  // doesn't throw) or the duplicate-send guard above never sees a row
  const { data: profile } = await admin.from('profiles').select('id').single()
  const { error: logError } = await admin
    .from('notification_log')
    .insert({ user_id: profile?.id, kind: 'evening_reminder', sent_for_date: today, channels })
  if (logError) return new Response(`log insert failed: ${logError.message}`, { status: 500 })

  return new Response(`ok (${channels.join('+') || 'no channels configured'})`)
})
