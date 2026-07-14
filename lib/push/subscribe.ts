'use client'
import { createClient } from '@/lib/supabase/client'

/** F8 — Web Push subscribe flow (doc 07 §8). Must run from a user gesture
 *  (iOS requirement), and on iOS only works inside the installed PWA. */

export type PushStatus = 'unsupported' | 'ios-needs-install' | 'denied' | 'on' | 'off'

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)

/** PushManager wants the VAPID public key as bytes, not base64url text. */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return bytes
}

/** What state is push in right now? Safe to call on mount (no permission prompt). */
export async function getPushStatus(): Promise<PushStatus> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return isIOS() && !isStandalone() ? 'ios-needs-install' : 'unsupported'
  }
  if (Notification.permission === 'denied') return 'denied'
  const reg = await navigator.serviceWorker.getRegistration('/sw.js')
  const sub = await reg?.pushManager.getSubscription()
  return sub ? 'on' : 'off'
}

/** Register the SW, ask permission, subscribe, and store the subscription
 *  where the evening-reminder function will find it. Idempotent (upsert on
 *  the unique endpoint). */
export async function enablePush(): Promise<PushStatus> {
  const reg = await navigator.serviceWorker.register('/sw.js')
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'off'

  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    }))

  const j = sub.toJSON()
  const supabase = createClient()
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      endpoint: j.endpoint!,
      p256dh: j.keys!.p256dh,
      auth: j.keys!.auth,
      user_agent: navigator.userAgent,
      last_used_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' },
  )
  if (error) throw new Error(error.message)
  return 'on'
}

/** Unsubscribe locally and forget the endpoint server-side. */
export async function disablePush(): Promise<PushStatus> {
  const reg = await navigator.serviceWorker.getRegistration('/sw.js')
  const sub = await reg?.pushManager.getSubscription()
  if (sub) {
    const supabase = createClient()
    await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
    await sub.unsubscribe()
  }
  return 'off'
}
