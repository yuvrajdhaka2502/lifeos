'use client'
import { useEffect, useState } from 'react'
import { Bell, BellOff, BellRing } from 'lucide-react'
import { disablePush, enablePush, getPushStatus, type PushStatus } from '@/lib/push/subscribe'

/** F8 — the "Enable reminders" control on /capture: the user gesture that
 *  registers the SW + push subscription the 10 PM reminder needs. Shows an
 *  honest state per platform (iOS wants the PWA installed first). */
export function EnableReminders() {
  const [status, setStatus] = useState<PushStatus | 'loading'>('loading')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPushStatus().then(setStatus)
  }, [])

  const toggle = async () => {
    setBusy(true)
    setError(null)
    try {
      setStatus(status === 'on' ? await disablePush() : await enablePush())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  if (status === 'loading') return null

  if (status === 'ios-needs-install') {
    return (
      <p className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-xs text-muted">
        <Bell className="h-4 w-4 shrink-0" />
        For the 10 PM push reminder: Share → <span className="text-foreground">Add to Home Screen</span>, then
        enable reminders from the installed app. (Email reminders work either way.)
      </p>
    )
  }

  if (status === 'unsupported') {
    return (
      <p className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-xs text-muted">
        <BellOff className="h-4 w-4 shrink-0" />
        This browser doesn&apos;t support push — the reminder falls back to email.
      </p>
    )
  }

  if (status === 'denied') {
    return (
      <p className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-xs text-muted">
        <BellOff className="h-4 w-4 shrink-0" />
        Notifications are blocked for this site — allow them in browser settings, then reload.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl border p-3 text-sm transition disabled:opacity-60 ${
          status === 'on'
            ? 'border-accent/40 bg-accent/10 text-foreground'
            : 'border-border bg-card text-muted hover:border-accent hover:text-foreground'
        }`}
      >
        {status === 'on' ? (
          <>
            <BellRing className="h-4 w-4 text-accent" /> 10 PM reminder is on
            <span className="text-xs text-muted">· tap to turn off</span>
          </>
        ) : (
          <>
            <Bell className="h-4 w-4" /> {busy ? 'Enabling…' : 'Enable the 10 PM push reminder'}
          </>
        )}
      </button>
      {error && (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-300">{error}</p>
      )}
    </div>
  )
}
