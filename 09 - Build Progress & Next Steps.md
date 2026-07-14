# LifeOS — Build Progress & Next Steps

Related: [[00 - LifeOS Overview]] · [[05 - Database Migration (DDL)]] · [[06 - Seed Script]] · [[07 - App Skeleton]] · [[08 - Setup & Deployment Runbook]]

> Living build log / session handoff. **As of 2026-07-07**: the DB is live, the app runs, **SDE + FDE were replaced by a single Study track** (seeded from [[Master_Roadmap]] — see [[Seed - Study]]), and **every feature F1–F8 is built**: F4 track pages, F1 dashboard, F5/F6 + F2 calendar/diary, F3 todos, **F7 capture + reminder LIVE** (Edge Function + pg_cron 22:00 IST + Resend email verified end-to-end), and **F8 PWA/Push + Aura polish** (manifest/icons/iOS meta, `sw.js`, subscribe flow on `/capture`, Aura completion effect, reduced-motion pass). All that remains is **Phase F — deploy to Vercel + install on the iPhone** (see below).

---

## ✅ Done so far

### Planning & design (docs 01–08)
- [x] PRD, Architecture, DB Schema, Frontend/UI — incl. the **F4b gym progress** change (`sets`/`reps`/`weight` persistent columns) propagated through every doc.
- [x] Sanity/bug pass (fixed confetti contradiction, stale diet open-question, period-scope wording).
- [x] Executable **DDL** (doc 05) and **Seed Script** (doc 06).
- [x] **App Skeleton** (doc 07) and **Setup Runbook** (doc 08, Arch-tailored).

### Phase A — Local prerequisites (Arch Linux)
- [x] Core tools installed (`nodejs`, `npm`, `git`, `base-devel`, `openssl`, `curl`).
- [x] `pnpm` installed (`sudo pacman -S pnpm`).
- [x] GitHub connected; repo created at **`~/Projects/lifeos`** (visibility: **public** ⚠️ — keep secrets out).
- [x] Supabase CLI working (see gotchas below for how).

### Phase B — Supabase project + schema  ✅ COMPLETE
- [x] Supabase project **LifeOS** created (Free tier).
- [x] API values captured: Project URL, anon key, service_role key (stored locally, not in repo).
- [x] CLI linked to the project (`supabase link`).
- [x] **Migration applied** — `0001_init.sql` pushed (`supabase db push`); all 11 tables + RLS + triggers live.
- [x] **Auth user created** (single account).
- [x] **Seed run** — 4 tracks → phases → sections → items inserted.
- [x] **Extensions** `pg_cron` + `pg_net` enabled.
- [x] **Verified** — verify query shows `sde` / `fde` / `gym` / `diet` all populated.

### Phase D — Scaffold & run the app  ✅ COMPLETE (2026-06-26)
- [x] **Bootstrapped Next.js** — `create-next-app` into the repo (moved docs + `supabase/` aside, restored after). Got **Next 16.2.9 / React 19 / Tailwind v4** (newer than the doc's "15"; works fine).
- [x] **Installed deps** — `@supabase/ssr @supabase/supabase-js @tanstack/react-query framer-motion lucide-react date-fns clsx tailwind-merge web-push`. Approved native builds (`sharp`, `unrs-resolver`) via `allowBuilds:` in `pnpm-workspace.yaml`.
- [x] **`.env.local`** — 3 Supabase values + `NEXT_PUBLIC_APP_URL`. `git check-ignore` confirms `.env.local` **and** `Keys.md` are ignored (root `.gitignore` had none — added).
- [x] **Types generated** — `lib/types.ts` (via the Supabase MCP integration; the CLI `gen types` needs a PAT we didn't have inline).
- [x] **Scaffold files written** — `lib/supabase/{client,server,admin,middleware}.ts`, `middleware.ts`, `lib/date.ts`, `lib/query/{provider.tsx,keys.ts}`, dark `globals.css` + tokens, `app/layout.tsx` (Providers), `app/(auth)/login/page.tsx`, `app/(app)/{layout,page}.tsx` (authed shell + dashboard listing seeded tracks with phase/item counts).
- [x] **Verified** — `tsc --noEmit` clean, `pnpm build` clean, `pnpm dev` runs: `/` → 307 → `/login`, `/login` renders the form. Seed confirmed live: 4 tracks · 23 phases · 18 sections · **170 items** · 1 profile.

### Session 2026-07-06 — SDE/FDE → Study swap + F4 track pages  ✅
- [x] **Feature change:** removed the SDE + FDE tracks entirely; replaced with one **Study** track seeded from [[Master_Roadmap]] (which lives in this repo). Decisions (all confirmed with the user):
  - **17 phase pages** — Blocks 1–15 + "Phase 4 — Interview Loops" + "Phase 5 — Negotiate & Close"; bold groups → sections; every `- [ ]` → item; ✅ exit checks → final items.
  - **Pinned panels:** *DSA Maintenance* (Phase-2 pattern lists) + *Projects A1 & A2* (Appendix-A deep-dive bars only; build days live in Blocks 7–11/13). Appendix D (weekly review) deliberately not seeded.
  - **Single Study-hours stream** replaces the two SDE/FDE hour fields (F7 capture now collects one hours value).
  - **Identity:** indigo→violet `#6366F1→#8B5CF6`, icon `graduation-cap`, slug `study`. Dashboard = **4 tiles**.
- [x] **DB applied live** — project had auto-paused (7-day free-tier pause) → restored; `supabase/seed_study.sql` run via the Supabase integration: deleted `sde`/`fde` (they had **0 completions / 0 hours** — nothing lost), seeded Study, re-ordered tiles (Study 1 · Gym 2 · Diet 3). Verified: **study 19 phases / 47 sections / 187 items · gym 1/7/52 · diet 2/0/14**. No DDL change was needed — the schema was already generic.
- [x] **F4 built — `/tracks/[slug]`** (branches on `track.layout`):
  - **Phased (Study):** `PhaseStepper` (17 nodes + per-phase %), animated phase switching (framer-motion slide), section accordions with mini-progress, optimistic ticks, multi-count support, resource-chip extraction from item titles, **pinned panels** (right sidebar desktop / collapsible mobile), **HoursWidget** (today ± 0.5h + week Σ), active phase remembered in `localStorage`.
  - **Panels (Gym/Diet):** weekly/daily period keys, **last-week score** chip, today's gym day highlighted, `ExerciseProgress` inline sets/reps/weight editor (writes `track_items` — survives the weekly reset), Diet 1–3 satisfaction faces (writes `daily_logs`).
  - **Data layer:** `useCompletions`/`useToggleItem` keyed by `(trackId, period)` (one fetch feeds stepper + page + pinned panels), `useHours`/`useSetHours`, `useDailyLog`/`useSetDietSatisfaction`, `useGymProgress`; `istWeekdayShort()` added to `lib/date.ts`.
- [x] **Docs updated in place** (00–09) + new [[Seed - Study]]; `Seed - SDE Month 1` / `Seed - FDE Month 1` deleted; doc 06's SDE/FDE SQL replaced with a pointer (Gym/Diet SQL kept); book chapters patched.
- [x] **Verified** — `tsc --noEmit` clean · `pnpm build` clean · dev-server smoke test (routes render/redirect correctly).

### Session 2026-07-06 (later) — F1 Dashboard  ✅
- [x] **`app/(app)/page.tsx` rewritten** — server-side aggregation (8 parallel queries: user, tracks, phases, items, completions across all 4 relevant period keys in one `in()`, week hours, logs, open todos) feeding 4 tiles per [[04 - Frontend & UI]] §5.1:
  - **Study** — gradient `ProgressRing` (% of the 173 navigable-page items; pinned-panel items excluded, same as the track page header), **current block** label (first block with unticked items), `today h` + `Σ wk h` stats.
  - **Gym** — this-week `done/total` + last-week chip. **Diet** — today's `meals/7`, satisfaction label, 7-day satisfaction strip. **To-Do** — open + urgent counts (ring shows all-clear at 0 open; `/todos` is F3, later).
- [x] **`RateTodayBanner`** — shown only while today is unrated (server passes today's log → no flash); tapping a star upserts `daily_logs.rating` optimistically (new `useSetRating`), banner collapses.
- [x] **`MiniCalendar`** — month heatmap colored by the 5 rating buckets (doc 04 palette), un-rated slate, today ringed, prev/next month via `useCalendar` (qk.calendar; next-month nav capped at current), **wk avg** pill (rated days only).
- [x] New pieces: `components/dashboard/{ProgressRing,TrackTile,RateTodayBanner,MiniCalendar}.tsx`, `lib/query/hooks/useCalendar.ts`, `useSetRating` in `useDailyLog.ts`, `istHour/istDisplayDate/istMonthKey/istLastNDates` in `lib/date.ts`. Greeting header ("Good evening, \<user\> · ☾ date") per the doc 04 sketch.
- [x] **Verified end-to-end** — `tsc` + `pnpm build` clean; drove the authed dashboard: fresh state (Block 1 · 0/173 · 0/52 · 0/7 · 0 open · banner visible), then wrote rating 4 + satisfaction 3 via the exact hook upserts → banner gone, `wk avg 4.0 ★`, today's cell `#84CC16`, diet sub "😀 ideal day" + green strip cell; test rows deleted after.

### Session 2026-07-06 (part 3) — F5/F6 + F2: Calendar + Diary  ✅
- [x] **`/calendar`** (`CalendarView` + `DayDetailSheet`) — full month heatmap (5 rating buckets + legend), month prev/next (capped at current), **wk avg** pill (`useWeekAverage`), future days disabled; tapping a past/today day slides up the **day-detail sheet**: editable **star rating (1–5)**, **diet faces (1–3)**, **diary** (debounced 800 ms autosave with saving/saved state), and that day's logged **hours** read-only (`useDayHours`, joins `tracks.name`). Deep-linkable via **`/calendar?d=YYYY-MM-DD`**.
- [x] **`/diary`** (`DiaryEditor`) — large autosaving writing surface per date; prev/next-day nav + Today jump; future days locked; reuses the shared `DiaryField`.
- [x] **Wiring** — header nav links (Home · Calendar · Diary) in the `(app)` layout; dashboard mini-calendar day cells now deep-link to `/calendar?d=`; new `useSetDiary` (optimistic, `diary:null` when emptied).
- [x] **Verified** — `tsc` + build clean; authed smoke: `/calendar` grid + wk-avg render, `?d=2026-07-05` SSRs the sheet, `/diary` renders with date nav; past-day rating + diary upserts (the exact hook payloads) hit the same `daily_logs` row without clobbering each other; test rows deleted.

### Session 2026-07-06 (part 4) — F3 General To-Do  ✅
- [x] **`/todos`** (`TodosView` + `useTodos` hooks) — urgency groups (Urgent/High/Medium/Low, colored left borders: `#EF4444/#FB923C/#EAB308/#64748B`), sorted by due date (nulls last) then created; **quick-add bar pinned at the bottom** (title + urgency + optional due date in one action, Enter submits); per-row complete-circle, **inline edit** (title/urgency/due), delete; **overdue chip** (due < today, red); completed items collapse under a **"Done" divider** (de-emphasized, newest first). All mutations optimistic via a shared list-mutation helper (add uses a temp id until invalidation).
- [x] Header nav gained **To-Do**; the dashboard tile's open/urgent counts react (server-verified).
- [x] **Verified** — `tsc` + build clean; exercised the exact hook payloads under RLS (insert urgent w/ past due date, insert low, toggle complete, delete); dashboard tile SSR'd "1 open · 1 urgent" with the test data; test rows deleted. *(The `/todos` list itself hydrates client-side — TanStack Query — so eyeball it in the browser once.)*

### Session 2026-07-06 (part 5) — F7 Capture + reminder  ✅ LIVE
*(Interrupted mid-way and resumed; the earlier half had already written `/capture`, generated Phase C keys, deployed the function, and scheduled pg_cron — the resume session found and fixed what was left.)*
- [x] **`/capture`** (`CaptureForm` + `saveDay` **server action**, doc 07 §6.3) — one screen: 1–5 stars, diet faces, Study-hours ±0.5 stepper, diary; everything optional and prefilled from today's rows so a submit never clobbers; one Save upserts `daily_logs` (rating/diary/diet) + the Study `track_hours` row, then `revalidatePath('/')` → `/`. Header nav gained **Check-in**.
- [x] **Phase C keys done** — VAPID pair + `CRON_SECRET` generated (in `.env.local`); **Resend API key** obtained from the user. All also in [[Keys]] (local only) along with a **Supabase PAT** for the CLI.
- [x] **`evening-reminder` Edge Function deployed (v2)** — `verify_jwt=false` (does its own `CRON_SECRET` bearer check); channel sends guarded by key/subscription presence; **six secrets set** via ` SUPABASE_ACCESS_TOKEN=<PAT> supabase secrets set --project-ref … ` (CRON_SECRET · VAPID ×3 · APP_URL · RESEND_API_KEY).
- [x] **🐛 Bug found & fixed in v2:** the `notification_log` insert had no `user_id` — the column default is `auth.uid()`, which is **null under the service role**, and supabase-js **doesn't throw**, so the insert failed *silently* and the duplicate-send guard would never fire. Fix: look up the single `profiles.id`, insert it explicitly, and check the returned `error` (500 on failure). Doc 07 §9 listing updated to as-built.
- [x] **pg_cron scheduled** — job `evening-reminder`, `30 16 * * *` (= 22:00 IST), `net.http_post` to `https://<ref>.supabase.co/functions/v1/evening-reminder` with the bearer.
- [x] **Verified end-to-end** — `tsc` + build clean (after excluding `supabase/functions` from tsconfig — gotcha 7); 401 without bearer; **"already logged"** with bearer while today was rated (smart suppression ✓); temporarily nulled today's rating → **"ok (email)" and a real reminder email delivered** to the inbox; `notification_log` row written **with user_id** ✓; second call → **"already sent"** (duplicate guard ✓); rating restored + test log row deleted, so tonight's real 22:00 IST run behaves normally.

### Session 2026-07-07 — F8 PWA + Push + Aura polish  ✅
- [x] **PWA shell** — `app/manifest.ts` (standalone, `#0A0A0F`, 192/512 + maskable), icons generated at `public/icons/{192,512,180}.png` (**rsvg-convert** — sharp turned out not to be installed; ProgressRing motif: iris→violet arc + lime mote on the dark tile), `app/layout.tsx` gained `appleWebApp` metadata (iOS ignores the manifest), `apple-touch-icon`, and a `viewport` export with `themeColor`.
- [x] **Push receive side** — `public/sw.js`: `push` → `showNotification` (icon + badge), `notificationclick` → `clients.openWindow(url || '/capture')`. No fetch caching in v1 (online-first by choice).
- [x] **Push subscribe side** — `lib/push/subscribe.ts` (`getPushStatus`/`enablePush`/`disablePush`; base64url→`Uint8Array` VAPID conversion; **upsert `push_subscriptions` onConflict `endpoint`**; unsubscribe deletes the row) + `components/push/EnableReminders.tsx` on **`/capture`** with honest per-platform states (iOS-not-installed hint · unsupported · denied · on/off toggle).
- [x] **Aura completion effect** (doc 04 §3) — `components/tracks/AuraCompletion.tsx`: `useAuraTrigger` watches the completions map and fires only on a *transition* to 100% (baseline seeded on first load, so never on mount; phase outranks section); visual = radial accent bloom + diagonal light-sweep over the card + glass toast with hairline accent underline and two slow lime motes. Wired into **PhasedTrackPage** (all phases incl. pinned) and **PanelsTrackPage** (per panel — Gym day sections, Diet "all 7 meals" = the day-complete moment).
- [x] **Reduced-motion pass** — `MotionConfig reducedMotion="user"` in `Providers` (framer drops transform/layout animation app-wide, keeps opacity) + CSS `prefers-reduced-motion` animation freeze in `globals.css`; Aura collapses to a fading toast.
- [x] **Verified** — `tsc` + `pnpm build` clean (one TS 5.7 quirk: `PushManager` wants `Uint8Array<ArrayBuffer>`, so the VAPID helper fills a fresh `new Uint8Array(len)`); dev smoke: `/manifest.webmanifest` serves the exact JSON, `sw.js` + all 3 icons 200 with right content-types, rendered `<head>` carries manifest link/theme-color/apple metas, `/capture` still gates (307). *Real-device step left for the user: install → tap "Enable the 10 PM push reminder" → a `push_subscriptions` row appears and the (already-live) Edge Function starts sending push.*

### Session 2026-07-14 — Phase F begins: first commit + push  ✅
- [x] **Initial commit `db886ab` pushed** to `github.com/yuvrajdhaka2502/lifeos` on branch **`main`** (85 files). Author/committer = the GitHub account only (repo-local `git config` with the `users.noreply.github.com` email — keeps the real address out of the public history); no co-author trailers.
- [x] **Pre-push secrets scan clean** — no key material in any tracked file; `.env.local` + `Keys.md` re-confirmed ignored. **`book/` added to `.gitignore`** (personal, stays local-only).
- [x] Push credentials via `gh` CLI (already authenticated); `gh auth setup-git` wired it as git's credential helper.

**→ Next: rest of Phase F** — Vercel import + env vars, then iPhone install + enable push. ⚠️ On deploy: update the function's `APP_URL` secret (currently `http://localhost:3000`) and `NEXT_PUBLIC_APP_URL`; production push requires HTTPS (Vercel gives it) — push doesn't work on plain `http://localhost` from a phone.

---

## ⏭️ To do next (resume point)

> The app is feature-complete and the code is on GitHub. What remains of **Phase F**: Vercel deploy, then the on-device steps.

### Phase F — Deploy + PWA on iPhone (doc 08 Phase F)
- [x] **First commit + push to GitHub** ✅ 2026-07-14 — `main` @ `db886ab`, sole author, secrets confirmed excluded, `book/` kept local.
- [ ] Vercel import + env vars (from web dashboard — user's choice): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL` (the Vercel URL), `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
- [ ] **Update the `APP_URL` function secret** to the Vercel URL (`supabase secrets set` — PAT in [[Keys]]).
- [ ] iPhone: open the Vercel URL in Safari → Share → **Add to Home Screen** → open the installed app → `/capture` → **Enable the 10 PM push reminder** (needs the user gesture) → verify a `push_subscriptions` row exists.
- [ ] Optional final proof: temporarily null today's rating and invoke the function with the bearer → expect `ok (push+email)`.

### Feature build order (after the shell runs; doc 07 §10)
Shell ✅ → Auth gate ✅ → F4 Study page ✅ → Gym/Diet ✅ → F1 Dashboard ✅ → F5/F6 + F2 Calendar ✅ → F3 Todos ✅ → F7 Capture + reminder ✅ → F8 PWA/Push + Aura polish ✅ → **Phase F deploy ← next**.

---

## 🔑 Key facts to remember next session
- **Repo:** `~/Projects/lifeos` (public GitHub repo). Migration lives at `supabase/migrations/0001_init.sql`.
- **Supabase project ref:** `mykmbxsltbodhlxpwbdu` (project **LifeOS**, org `mhovhhigvknsxwxttfoi`). URL `https://mykmbxsltbodhlxpwbdu.supabase.co`.
- **Stack as built:** Next **16.2.9** (App Router) · React 19 · Tailwind **v4** · pnpm. Note Next 16 deprecated `middleware` → `proxy` (still works; rename `middleware.ts`→`proxy.ts` exporting `proxy` to silence the warning).
- **Three project keys** stored locally only — never in the public repo:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (safe to expose), `SUPABASE_SERVICE_ROLE_KEY` (secret).
- Using the **legacy** anon + service_role key pair (maps to our env names); the newer `sb_publishable_…` is the equivalent of anon if ever migrating.

## ⚠️ Gotchas hit this session (and the fixes — so we don't repeat them)
1. **AUR `supabase-bin` is a broken shim** (looks for a missing `supabase-go`). **Fix:** installed the official tarball into `~/.local/share/supabase` and prepended it to `PATH` in `~/.bashrc`. `which supabase` should point there, not `/usr/bin`.
2. **`supabase login` didn't persist the token** (no Secret Service keyring on minimal Arch → `db push` said "Access token not provided"). **Fix:** use a **Personal Access Token** inline per command: `SUPABASE_ACCESS_TOKEN=sbp_xxx supabase db push` (PAT from Account → Access Tokens). Prefix with a space to keep it out of shell history.
3. **Migration file was created at repo root**, but `db push` only reads `supabase/migrations/`. **Fix:** moved it in before pushing.
4. **`create-next-app` will refuse** to scaffold into `~/Projects/lifeos` because of the `supabase/` folder **and the `.md` docs**. **Fix (Phase D Step 1):** move *all* `.md` docs + `supabase/` to a backup dir → scaffold into `.` → move them back.
5. **pnpm blocked native build scripts** (`sharp`, `unrs-resolver`) → `ERR_PNPM_IGNORED_BUILDS`. **Fix:** set `allowBuilds: { sharp: true, unrs-resolver: true }` in `pnpm-workspace.yaml`, then `pnpm install`. (Not strictly needed for `dev`, but clears the error.)
6. **`supabase gen types` failed with `Unauthorized`** (same missing-PAT issue as the CLI login). **Fix this session:** generated types through the **Supabase MCP integration** instead. Alternatively prefix with `SUPABASE_ACCESS_TOKEN=sbp_xxx`.
7. **`tsc --noEmit` broke after adding the Edge Function** — the Next.js tsconfig `include: ["**/*.ts"]` swept in the Deno file → 14 × `Cannot find name 'Deno'`. **Fix:** add `"supabase/functions"` to tsconfig `exclude` (Deno code is type-checked by Deno, not the app's tsc).
8. **Edge Function secrets can't be set through the MCP integration** — only deploy/list. **Fix:** ` SUPABASE_ACCESS_TOKEN=<PAT> supabase secrets set --project-ref mykmbxsltbodhlxpwbdu KEY=VALUE …` (PAT now saved in [[Keys]]). Verify with `supabase secrets list`. Secrets take a few seconds to propagate to the function.
9. **Service-role inserts skip `auth.uid()` defaults** — any table whose `user_id` default is `auth.uid()` gets **null** when written by the service role (e.g. from an Edge Function), and supabase-js returns the error instead of throwing → easy to miss. **Fix:** pass `user_id` explicitly and check the `error` field.

## How to re-seed during development (if needed)
```sql
delete from public.tracks where user_id = '<your-user-id>';  -- cascades to phases/sections/items/completions
```
…then re-run the seed from [[06 - Seed Script]] (after the user still exists).
