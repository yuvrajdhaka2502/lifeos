# LifeOS — System Architecture & Tech Stack

Related: [[00 - LifeOS Overview]] · [[01 - PRD]] · [[03 - Database Schema]]

---

## 1. Architecture at a glance
A **Next.js** app on **Vercel** talking to **Supabase** (Postgres + Auth + Edge Functions + pg_cron). The model is deliberately simple: **no instance-generation job** is needed (see §3), so the only scheduled task is the **10 PM reminder** that fires Web Push + Email.

```
                 ┌─────────────────────────────────────────────┐
   iPhone PWA ──▶│                Vercel (Hobby)                │
   Laptop    ──▶ │   Next.js App Router (SSR + API routes)      │
                 │   - 4-tile dashboard, track pages, calendar  │
                 │   - server actions / route handlers          │
                 └───────────────┬─────────────────────────────┘
                                 │  Supabase JS client (RLS-protected)
                                 ▼
                 ┌─────────────────────────────────────────────┐
                 │                 Supabase (Free)              │
                 │  ┌───────────┐  ┌──────────┐  ┌───────────┐  │
                 │  │ Postgres  │  │  Auth    │  │ Edge Func │  │
                 │  │ + RLS     │  │ (single) │  │ (reminder)│  │
                 │  └───────────┘  └──────────┘  └─────▲─────┘  │
                 │        pg_cron 22:00 IST ───────────┘        │
                 └─────────────────────┬──────────────────────-┘
                                       ▼
                          ┌────────────────────────┐
                          │  Web Push (VAPID) ──▶ iPhone/Laptop
                          │  Email (Resend)  ──▶ inbox
                          └────────────────────────┘
```

## 2. Tech stack
| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router, TypeScript)** | SSR + API routes; one codebase for UI + backend glue; Vercel-native. |
| Hosting | **Vercel (Hobby)** | Free, automatic HTTPS (required for PWA/push). |
| Database | **Supabase Postgres (Free)** | Relational fits tracks → sections → items → completions; RLS for privacy. |
| Auth | **Supabase Auth** | Single-user login; integrates with RLS. |
| Data access | **Supabase JS client** + **TanStack Query** | Typed queries, caching, optimistic checkbox toggles. |
| Scheduled job | **Supabase `pg_cron`** + **Edge Function** | One reliable daily job (10 PM reminder). |
| Web Push | **Web Push API + VAPID** (service worker) | Free, works on iOS 16.4+ when installed as a PWA. |
| Email | **Resend (Free: 3k/mo, 100/day)** | Simple transactional backup reminder. |
| Styling | **Tailwind CSS + shadcn/ui** | Mobile-first, consistent, fast. |
| PWA | **manifest + service worker** (or `next-pwa`) | Installable + push subscription on iOS. |

## 3. Why there is no generation job (key simplification)
The earlier design needed a nightly job to spawn daily/weekly checklist instances. The revised model removes that — each **phase** has a `period_scope`, and completion is **keyed by period**, so the right checklist appears automatically:

- **static phases** (Study phase pages, DSA Maintenance, Projects): `period_key = 'static'` → one completion row per item, never reset.
- **weekly phases** (Gym *This Week*, Diet *Weekly Protocol*): `period_key = Monday's date`. A new week has *no rows yet* → renders unchecked **automatically**; "last week's score" = completions for last Monday's key.
- **daily phases** (Diet *Daily Meals*): `period_key = today's date`. A new day → the 7 meal slots render unchecked **automatically**. Diet satisfaction (1–3) is stored on `daily_logs`.

→ The only moving scheduled part is the **10 PM reminder**. Everything else is plain reads/writes — more robust (nothing to fail or back-fill) and easier to reason about.

## 4. Timezone handling (important)
- User is in **IST (Asia/Kolkata, UTC+5:30)** — no DST, so scheduling is fixed.
- Store timestamps as `timestamptz` (UTC); store "dates" (log date, week start) as `date` interpreted in IST.
- **Cron runs in UTC:** 10:00 PM IST = **16:30 UTC** → reminder job (`30 16 * * *`).
- "Today" and "this week" everywhere = computed in IST via a single shared helper. Week starts **Monday** (matches the gym split).

## 5. Scheduled job (the only one)
| Job | Schedule (UTC) | IST | Action |
|---|---|---|---|
| **Evening reminder** | `30 16 * * *` | 22:00 daily | If today isn't fully logged, send Web Push + Email deep-linking to the "close out the day" screen (rating + diary + Study hours + diet satisfaction). |

## 6. The "close out the day" capture (F7)
The reminder deep-links to one screen that writes, for **today (IST)**:
- `daily_logs.rating` (1–5), `daily_logs.diary`, and `daily_logs.diet_satisfaction` (1–3).
- One `track_hours` row for **Study** (`hours`, default 0) — upserted on `(track_id, log_date)`.

All fields submit together; hours pre-fill to 0 (or to any value already entered earlier in the day).

## 7. Notification pipeline (10 PM)
**Subscription (one-time per device):**
1. Install PWA (iOS: Add to Home Screen — required for push).
2. App requests permission *after* install; service worker registers a Push Subscription.
3. Save subscription to `push_subscriptions`.

**Delivery (nightly):**
1. `pg_cron` 16:30 UTC invokes the reminder Edge Function.
2. Function checks whether today is already logged (rating present) → optionally soften/skip.
3. Sends Web Push (VAPID) to each subscription; sends backup email (Resend); logs to `notification_log`.
4. Prunes dead subscriptions on 404/410.

**iOS specifics:** web push only works once the site is on the Home Screen (iOS 16.4+) with permission granted post-install; the app guides this. Email backup covers denial/unavailability.

## 8. Auth & security
- Supabase Auth, single account; app gated behind login.
- **RLS ON for every table**, policy `user_id = auth.uid()`.
- Only the **anon/publishable key** ships to the browser; the **service-role key** is server-only (Edge Function/server actions) and never exposed.
- HTTPS everywhere (required for service workers/push).

## 9. Data flow examples
- **Toggle a static item (Study):** optimistic UI → upsert `item_completions(item_id, 'static', completed)` → Study tile progress refetch.
- **Toggle a weekly item (Gym):** upsert `item_completions(item_id, <this Monday>, completed[, completed_count])` → Gym tile this-week count refetch.
- **Toggle a daily meal (Diet):** upsert `item_completions(item_id, <today>, completed)` → Diet tile `meals done / 7` refetch.
- **Edit gym progress (sets/reps/weight):** optimistic UI → update `track_items` `sets`/`reps`/`weight` for that item. Persistent item state — **no `period_key`, untouched by the weekly refresh** (PRD F4b); only the gym page re-renders.
- **Log hours:** upsert `track_hours(track_id, today, hours)` → Study tile "hours this week" refetch.
- **Rate + journal + diet satisfaction:** upsert `daily_logs(today, rating, diary, diet_satisfaction)` → calendar + average + Diet tile refetch.
- **Last-week score (Gym):** count `item_completions` where `track_id = gym and period_key = <last Monday> and completed`.

## 10. Seeding the tracks from the plans
On first run, a one-time seed inserts:
- `tracks` + their `track_phases` (period scope lives on the **phase**, not the track: Study phases = `static`; Gym *This Week* = `weekly`; Diet *Daily Meals* = `daily` + *Weekly Protocol* = `weekly`), `track_sections`, `track_items`.
- Study sections + items = every checkbox in [[Master_Roadmap]] per the mapping in [[Seed - Study]] (`supabase/seed_study.sql`); Gym = Mon–Sun split; Diet = the 7 meal slots with planned-food notes ([[06 - Seed Script]]).
After seeding, everything is edited in-app — the app does not re-sync from the docs (keeps them decoupled). *(2026-07-06: the original SDE + FDE tracks were deleted and replaced by Study via `seed_study.sql`.)*

## 11. Environments & deployment
- **Local:** Next.js dev + Supabase (cloud project or local CLI stack).
- **Prod:** Vercel linked to Git. Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, server-only `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `RESEND_API_KEY`.
- Reminder Edge Function deployed to Supabase; the `pg_cron` schedule created via migration.

## 12. Supabase Free-tier analysis (verdict: comfortably enough)
| Resource | Free limit | LifeOS need | Verdict |
|---|---|---|---|
| Database size | 500 MB | Text + small numbers; checklist items, completions, daily logs, hours ≈ a few MB over years | ✅ Huge headroom |
| Auth users | 50,000 MAU | 1 | ✅ |
| Edge Function invocations | ~500k–2M/mo | ~1/day (reminder) | ✅ |
| Egress | ~5 GB/mo | Tiny JSON | ✅ |
| Storage (files) | 1 GB | None in v1 | ✅ |

**The one caveat — auto-pause:** free Supabase projects pause after **7 days of no activity**. Daily use + the nightly reminder job keep it awake; if it ever pauses, one "Restore" click revives it. Not a real risk for daily use.

**Vercel Hobby** (single-user, non-commercial) and **Resend free** (one email/night ≈ 30/month vs 3,000 limit) are both well within limits.

**Conclusion:** Free tiers are more than sufficient; no paid upgrade anticipated.

## 13. Risks & mitigations
| Risk | Mitigation |
|---|---|
| iOS push not delivered (not installed / denied) | Email backup; clear install + permission onboarding. |
| Free project auto-pause | Daily use + nightly job keep it active. |
| Timezone bugs (UTC vs IST) | Single IST date/week helper; `timestamptz` storage; documented 16:30 UTC cron. |
| Duplicate reminders | Reminder checks "already logged" + `notification_log` guard. |
| Editing a track item mid-week corrupting history | Completions reference item IDs + `period_key`; past weeks untouched; soft-delete via `is_active`. |
