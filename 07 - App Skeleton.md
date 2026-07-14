# LifeOS — App Skeleton (implementation scaffold)

Related: [[00 - LifeOS Overview]] · [[02 - System Architecture & Tech Stack]] · [[03 - Database Schema]] · [[04 - Frontend & UI]] · [[05 - Database Migration (DDL)]] · [[06 - Seed Script]] · [[08 - Setup & Deployment Runbook]]

> The code-level scaffold for implementation: dependencies, folder layout, the Supabase clients, the **one** IST date helper everything keys off, the TanStack Query data layer (with a fully-worked optimistic toggle + the gym-progress mutation), the route map, the reminder Edge Function, and the build order. For the **manual / dashboard / device** steps (create the Supabase project, keys, deploy, install on iPhone) see the runbook → [[08 - Setup & Deployment Runbook]].

## 0. Decisions locked here (so implementation has no forks)
- **Framework:** Next.js **15** App Router, TypeScript, React 19. **Package manager:** pnpm.
- **Supabase access:** `@supabase/ssr` (browser + server cookie clients) for user/RLS work; `@supabase/supabase-js` with the **service-role** key for server-only admin (reminder). The deprecated `auth-helpers` package is **not** used.
- **Data layer:** TanStack Query v5, **optimistic** mutations for every toggle/edit; a single query-key factory.
- **Dates:** one module `lib/date.ts` is the *only* place IST/week logic lives (PRD/arch §4). Never call `new Date().getDay()` in a component.
- **Auth:** single user; a Next `middleware.ts` refreshes the session and gates everything except `/login` and PWA assets.
- **Reminder:** Supabase **Edge Function** + **pg_cron → pg_net** HTTP call at 16:30 UTC (= 22:00 IST). Not Vercel Cron.
- **PWA:** hand-rolled service worker (`public/sw.js`) for push (more control on iOS than `next-pwa`).
- **Styling:** Tailwind v4 + shadcn/ui + Framer Motion + lucide-react (per [[04 - Frontend & UI]]).

---

## 1. Bootstrap
```bash
# 1. scaffold
pnpm create next-app@latest lifeos --ts --app --tailwind --eslint --src-dir=false --import-alias "@/*"
cd lifeos

# 2. runtime deps
pnpm add @supabase/ssr @supabase/supabase-js @tanstack/react-query \
         framer-motion lucide-react date-fns clsx tailwind-merge web-push

# 3. dev + UI primitives
pnpm add -D supabase
pnpm dlx shadcn@latest init        # dark theme; then add primitives as needed:
pnpm dlx shadcn@latest add button card sheet dialog tabs accordion progress switch toast tooltip input textarea select
```
> `web-push` is used only server-side (subscribe verification / local testing); the live send runs in the Deno Edge Function via `npm:web-push`.

## 2. Folder layout
```
lifeos/
├─ app/
│  ├─ layout.tsx                 # root: fonts, <Providers>, <html lang> 
│  ├─ globals.css                # Tailwind + design tokens from [[04 - Frontend & UI]] §2
│  ├─ manifest.ts                # PWA manifest (Next metadata route)
│  ├─ (auth)/login/page.tsx      # email+password (single user)
│  └─ (app)/                     # authed shell (AuroraBackground + nav)
│     ├─ layout.tsx              # BottomNav (mobile) / Sidebar (desktop)
│     ├─ page.tsx                # F1 Dashboard — 4 tiles + mini calendar
│     ├─ tracks/[slug]/page.tsx  # F4 — switches render by track.layout
│     ├─ calendar/page.tsx       # F2
│     ├─ diary/page.tsx          # F6
│     ├─ todos/page.tsx          # F3
│     └─ capture/page.tsx        # F7 — deep-link target for the 10 PM push
├─ components/
│  ├─ ui/                        # shadcn primitives
│  ├─ dashboard/ (TrackTile, RateTodayBanner, MiniCalendar…)
│  ├─ tracks/    (PhaseStepper, ChecklistItem, PinnedPanel, ExerciseProgress, HoursStepper…)
│  ├─ calendar/  (HeatmapCalendar, DayDetailSheet…)
│  └─ shell/     (AuroraBackground, BottomNav, Sidebar, GlassToast, AuraCompletion…)
├─ lib/
│  ├─ supabase/{client.ts, server.ts, admin.ts, middleware.ts}
│  ├─ date.ts                    # the ONLY IST/week module
│  ├─ types.ts                   # `supabase gen types` output
│  └─ query/{provider.tsx, keys.ts, hooks/*.ts}
├─ supabase/
│  ├─ migrations/0001_init.sql   # = paste [[05 - Database Migration (DDL)]]
│  ├─ seed.sql                   # = paste [[06 - Seed Script]] (Gym+Diet; run once, after user exists)
│  ├─ seed_study.sql             # Study track from Master_Roadmap.md (replaced SDE/FDE, 2026-07-06)
│  └─ functions/evening-reminder/index.ts
├─ public/{sw.js, icons/…}
├─ middleware.ts
└─ .env.local
```

## 3. Environment variables (`.env.local`)
See also [[02 - System Architecture & Tech Stack]] §11 and the runbook for where each value comes from.
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/publishable key>
SUPABASE_SERVICE_ROLE_KEY=<server-only — never NEXT_PUBLIC>
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<vapid public>
VAPID_PRIVATE_KEY=<vapid private — server only>
VAPID_SUBJECT=mailto:f20220098@pilani.bits-pilani.ac.in
RESEND_API_KEY=<resend key — server only>
CRON_SECRET=<random string — guards the reminder function>
NEXT_PUBLIC_APP_URL=https://lifeos.vercel.app   # deep-link base for the push
```

---

## 4. Supabase clients

`lib/supabase/client.ts` (browser / client components)
```ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types'
export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
```

`lib/supabase/server.ts` (RSC + route handlers; Next 15 → `cookies()` is async)
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types'

export async function createClient() {
  const store = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (toSet) => {
          try { toSet.forEach(({ name, value, options }) => store.set(name, value, options)) }
          catch { /* in a RSC: ignore — middleware refreshes the cookie */ }
        },
      },
    },
  )
}
```

`lib/supabase/admin.ts` (server-only — bypasses RLS; import ONLY in route handlers / the Edge Function)
```ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types'
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
)
```

`middleware.ts` + `lib/supabase/middleware.ts` (refresh session, gate routes)
```ts
// middleware.ts
import { updateSession } from '@/lib/supabase/middleware'
export const middleware = updateSession
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons/).*)'],
}
```
```ts
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let res = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value))
          res = NextResponse.next({ request })
          toSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return res
}
```

---

## 5. The IST date module (`lib/date.ts`) — single source of truth
> IST = UTC+5:30, no DST. Trick: shift the instant by +5:30, then read it with the UTC getters → you get IST wall-clock without any tz library.
```ts
import type { Database } from '@/lib/types'
type Scope = Database['public']['Enums']['period_scope']

const IST_MIN = 330 // 5*60 + 30
const shift = (d: Date) => new Date(d.getTime() + IST_MIN * 60_000)

/** 'YYYY-MM-DD' for the IST calendar day of `d`. */
export const istDateKey = (d = new Date()) => shift(d).toISOString().slice(0, 10)

/** Monday (IST) of `d`'s week, 'YYYY-MM-DD'. */
export function istWeekKey(d = new Date()) {
  const x = shift(d)
  const mondayOffset = (x.getUTCDay() + 6) % 7      // Mon=0 … Sun=6
  x.setUTCDate(x.getUTCDate() - mondayOffset)
  return x.toISOString().slice(0, 10)
}

/** Previous Monday — for the Gym/Protocol "last week" score. */
export function istLastWeekKey(d = new Date()) {
  const x = shift(d)
  x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7) - 7)
  return x.toISOString().slice(0, 10)
}

/** The period_key for an item, from its phase's scope (DB §4 / arch §3). */
export function periodKey(scope: Scope, d = new Date()) {
  return scope === 'static' ? 'static' : scope === 'weekly' ? istWeekKey(d) : istDateKey(d)
}
```

---

## 6. Data layer (TanStack Query)

`lib/query/provider.tsx`, mounted in `app/layout.tsx`
```tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
  }))
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}
```

`lib/query/keys.ts`
```ts
export const qk = {
  tracks:       ['tracks'] as const,
  track:        (slug: string) => ['track', slug] as const,
  phase:        (phaseId: string, period: string) => ['phase', phaseId, period] as const,
  trackScore:   (trackId: string, period: string) => ['score', trackId, period] as const,
  hours:        (trackId: string) => ['hours', trackId] as const,
  dailyLog:     (dateKey: string) => ['daily_log', dateKey] as const,
  calendar:     (monthKey: string) => ['calendar', monthKey] as const,
  todos:        ['todos'] as const,
}
```

### 6.1 Optimistic item toggle — fully worked (the core interaction, F4)
`lib/query/hooks/useToggleItem.ts`
```ts
'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { qk } from '../keys'

type Row = { id: string; completed: boolean; completed_count: number } // item w/ its completion

export function useToggleItem(phaseId: string, period: string) {
  const supabase = createClient()
  const qc = useQueryClient()
  const key = qk.phase(phaseId, period)

  return useMutation({
    mutationFn: async (v: { itemId: string; trackId: string; completed: boolean; count?: number }) => {
      const { error } = await supabase.from('item_completions').upsert(
        { item_id: v.itemId, track_id: v.trackId, phase_id: phaseId,
          period_key: period, completed: v.completed, completed_count: v.count ?? 1 },
        { onConflict: 'item_id,period_key' },
      )
      if (error) throw error
    },
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<Row[]>(key)
      qc.setQueryData<Row[]>(key, (rows) =>
        rows?.map((r) => r.id === v.itemId
          ? { ...r, completed: v.completed, completed_count: v.count ?? 1 } : r))
      return { prev }
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(key, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}
```
> **As built (2026-07-06):** the shipped hook is `lib/query/hooks/useCompletions.ts`, which keys the cache by **`(trackId, period)`** instead of `(phaseId, period)` — one completions map feeds the stepper %, the active phase page, the pinned panels, and the weekly last-week score from a single fetch. Same optimistic upsert pattern as above.

### 6.2 Gym progress edit (F4b) — fully worked
`lib/query/hooks/useGymProgress.ts`
```ts
'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { qk } from '../keys'

export function useGymProgress(phaseId: string, period: string) {
  const supabase = createClient()
  const qc = useQueryClient()
  const key = qk.phase(phaseId, period)
  return useMutation({
    // sets/reps are whole numbers or null; weight is free text or null (DB §2)
    mutationFn: async (v: { itemId: string; sets: number | null; reps: number | null; weight: string | null }) => {
      const { error } = await supabase.from('track_items')
        .update({ sets: v.sets, reps: v.reps, weight: v.weight }).eq('id', v.itemId)
      if (error) throw error
    },
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<any[]>(key)
      qc.setQueryData<any[]>(key, (rows) =>
        rows?.map((r) => r.id === v.itemId ? { ...r, ...v } : r))
      return { prev }
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(key, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}
```
> Note this writes `track_items`, **not** `item_completions` — that's structurally why the weekly refresh never touches it (PRD F4b).

### 6.3 Evening capture (F7) — one server action
`app/capture/actions.ts`
```ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { istDateKey } from '@/lib/date'

export async function saveDay(input: {
  rating: number | null; diary: string | null; dietSatisfaction: number | null;
  studyHours: number; studyTrackId: string;
}) {
  const supabase = await createClient()
  const today = istDateKey()
  await supabase.from('daily_logs').upsert(
    { log_date: today, rating: input.rating, diary: input.diary, diet_satisfaction: input.dietSatisfaction },
    { onConflict: 'user_id,log_date' })
  await supabase.from('track_hours').upsert(
    { track_id: input.studyTrackId, log_date: today, hours: input.studyHours },
    { onConflict: 'track_id,log_date' })
}
```

### 6.4 Remaining hooks (stubs — same optimistic pattern)
| Hook | Reads/Writes | Feature |
|---|---|---|
| `useTracks()` | `tracks` (+ rolled-up progress/hours) | F1 tiles |
| `usePhase(phaseId, scope)` | `track_items` + `item_completions` for `periodKey(scope)` | F4 page |
| `useHours(trackId)` | `track_hours` upsert + 7-day history | F4a |
| `useDailyLog(dateKey)` | `daily_logs` | F2/F5/F6 |
| `useCalendar(monthKey)` | `daily_logs` range → heatmap + weekly avg | F2 |
| `useTodos()` | `todos` CRUD, group by urgency | F3 |
| `usePushSubscribe()` | `push_subscriptions` insert | F8 |

---

## 7. Route → feature map
| Route | Feature | Notes |
|---|---|---|
| `/login` | F8 | email+password; the only public route |
| `/` | F1 + F2 | 4 tiles + mini calendar + Rate-today banner |
| `/tracks/[slug]` | F4 | branch on `track.layout`: `phased` → PhaseStepper + ChecklistItem + PinnedPanel; `panels` → Gym (sections + `ExerciseProgress`) / Diet (meals + protocol) |
| `/calendar` | F2 | month heatmap, day detail sheet |
| `/diary` | F6 | autosave textarea, date nav |
| `/todos` | F3 | urgency groups, swipe complete/delete |
| `/capture` | F7 | deep-link target; calls `saveDay()` |

---

## 8. PWA + Push

`app/manifest.ts`
```ts
import type { MetadataRoute } from 'next'
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LifeOS', short_name: 'LifeOS', start_url: '/', display: 'standalone',
    background_color: '#0A0A0F', theme_color: '#0A0A0F',
    icons: [
      { src: '/icons/192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
```

`public/sw.js` (push display + click-through)
```js
self.addEventListener('push', (e) => {
  const d = e.data?.json() ?? {}
  e.waitUntil(self.registration.showNotification(d.title ?? 'LifeOS', {
    body: d.body ?? 'Close out your day', icon: '/icons/192.png', data: d.url ?? '/capture',
  }))
})
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(clients.openWindow(e.notification.data || '/capture'))
})
```

Subscribe flow (`lib/push/subscribe.ts`) — call **after** PWA install + a user gesture (iOS requirement). **As built (2026-07-07)** it grew beyond this sketch: the VAPID key must be converted **base64url → `Uint8Array`** before `subscribe()` (the raw string fails on some browsers, and TS 5.7 wants `Uint8Array<ArrayBuffer>` specifically); the row is **upserted `onConflict: 'endpoint'`** (endpoint is unique — re-enabling is idempotent); and it exports `getPushStatus`/`enablePush`/`disablePush` consumed by `components/push/EnableReminders.tsx` on `/capture`, which shows per-platform states (iOS-not-installed hint / unsupported / denied / on / off).
```ts
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
  // upsert into push_subscriptions (onConflict: endpoint) via the client supabase
  …
}
```

---

## 9. Reminder Edge Function (the only scheduled job)

`supabase/functions/evening-reminder/index.ts` (Deno) — **as deployed 2026-07-06** (v2). Differences from the first draft, learned the hard way: each channel is guarded by whether its keys/subscriptions exist (so the function works before F8 push and before a custom email domain); the sender is Resend's shared `onboarding@resend.dev` (a custom domain can come later); and the `notification_log` insert **must set `user_id` explicitly and check its error** — the column's default is `auth.uid()`, which is *null* for the service role, and supabase-js doesn't throw, so the failed insert was silent and the duplicate-send guard never saw a row.
```ts
import webpush from 'npm:web-push@3'
import { Resend } from 'npm:resend@4'
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.headers.get('authorization') !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('unauthorized', { status: 401 })
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // IST "today" (UTC+5:30, no DST)
  const today = new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10)

  // smart suppression: skip if today already rated
  const { data: log } = await admin.from('daily_logs').select('rating').eq('log_date', today).maybeSingle()
  if (log?.rating != null) return new Response('already logged')

  // guard against duplicate sends
  const { data: already } = await admin.from('notification_log')
    .select('id').eq('kind', 'evening_reminder').eq('sent_for_date', today).maybeSingle()
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
      title: 'Rate your day', body: 'Log Study hours, diet & journal', url: `${appUrl}/capture`,
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
        from: 'LifeOS <onboarding@resend.dev>', to,
        subject: 'Close out your day',
        html: `<p>Rate the day, log Study hours, diet & journal.</p><p><a href="${appUrl}/capture">Open the check-in →</a></p>`,
      })
      channels.push('email')
    } catch { /* non-fatal — push is primary */ }
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
```

Deployed with **`verify_jwt: false`** — the function does its own auth (the `CRON_SECRET` bearer check on line 1); pg_cron isn't a logged-in user and has no JWT to present.

Function secrets (set via `supabase secrets set --project-ref <ref> KEY=VALUE …` with a PAT, or the dashboard): `CRON_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `APP_URL`, `RESEND_API_KEY`. (`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are auto-injected by the platform.) ⚠️ `APP_URL` is `http://localhost:3000` until the Vercel deploy (Phase F) — update it then.

`pg_cron` schedule (run once in SQL editor — see runbook §E). Note the URL shape: **`https://<ref>.supabase.co/functions/v1/<name>`**.
```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule('evening-reminder', '30 16 * * *', $$
  select net.http_post(
    url     := 'https://<ref>.supabase.co/functions/v1/evening-reminder',
    headers := jsonb_build_object('Content-Type','application/json',
                                  'Authorization','Bearer <CRON_SECRET>'),
    body    := '{}'::jsonb
  );
$$);
```

---

## 10. Build order (each step independently demoable)
0. **Setup** — runbook §A–D: project, migration, **seed**, types, env, login works.
1. **Shell** — root layout, `Providers`, `AuroraBackground`, BottomNav/Sidebar, design tokens.
2. **Auth gate** — middleware + `/login`; redirect works.
3. **F4 Study page** — `useCompletions` + `useToggleItem` + PhaseStepper + PinnedPanel (this proves the whole period-key model end-to-end). ✅ built 2026-07-06
4. **F4b/F4c/F4d Gym & Diet** — sections, `ExerciseProgress`, weekly/daily scope, last-week score. ✅ built 2026-07-06
5. **F1 Dashboard** — tiles roll up from the hooks above. ✅ built 2026-07-06
6. **F5/F6 + F2** — rating, diary, calendar heatmap. ✅ built 2026-07-06
7. **F3 Todos.** ✅ built 2026-07-06
8. **F7 Capture + reminder** — `/capture`, Edge Function, pg_cron (build last; most moving parts). ✅ built 2026-07-06 (function live, cron scheduled, email verified)
9. **F8 PWA/Push polish** + the Aura completion effect + reduced-motion pass. ✅ built 2026-07-07

> Maps 1:1 onto the PRD priority table (§6) — F1/F4/F5/F6/F2/F3/F8 are "Must", F7 "build last".

## 11. Generate DB types whenever the schema changes
```bash
pnpm dlx supabase gen types typescript --project-id <ref> --schema public > lib/types.ts
```
