# LifeOS — Setup & Deployment Runbook

Related: [[00 - LifeOS Overview]] · [[05 - Database Migration (DDL)]] · [[06 - Seed Script]] · [[07 - App Skeleton]]

> Every **hands-on / dashboard / device** step to take LifeOS from empty to live — the things code can't do for you. Do the phases in order; each ends with a concrete "✓ you should see…". Legend: **[YOU]** = only you can do it (account/dashboard/phone) · **[CODE/CLI]** = a command or file from [[07 - App Skeleton]] · **[CLAUDE]** = I can do it through the Supabase integration if you ask.
>
> **Environment: Arch Linux.** All shell commands below are written for Arch (`pacman` + an AUR helper such as `yay`). If you don't have an AUR helper yet: `sudo pacman -S --needed base-devel git` then `git clone https://aur.archlinux.org/yay.git && cd yay && makepkg -si`. **Docker is NOT required** for this cloud-only flow (you'd only need it for a local Supabase stack).

---

## Phase A — Local prerequisites (Arch Linux)  *(~15 min)*  **[YOU]**

**A1 — Update the system & install core tools**
```bash
sudo pacman -Syu --needed git base-devel nodejs npm openssl curl
```
Arch's `nodejs` is current (22.x) — comfortably ≥ 20. Check: `node -v`.

**A2 — Enable pnpm via Corepack** (ships with Node, no global npm install needed)
```bash
sudo corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
```
*(Alternative: `sudo pacman -S pnpm`. Don't mix both — pick one.)*

**A3 — Install the GitHub CLI and create the repo**
```bash
sudo pacman -S --needed github-cli
gh auth login                       # choose GitHub.com → SSH or HTTPS → browser
gh repo create lifeos --private --clone
cd lifeos
```
*(Or create the repo on github.com and `git clone` it.)*

**A4 — Install the Supabase CLI** — it is **not** in the official repos. Pick one:
```bash
yay -S supabase-bin                 # AUR (recommended — gives a real `supabase` binary)
```
No AUR helper / don't want one? Skip the install and prefix every Supabase command in this runbook with `pnpm dlx`, e.g. `pnpm dlx supabase --version`.

**A5 — (Optional) Vercel CLI** — you can deploy entirely from the web dashboard (Phase F) and skip this:
```bash
pnpm add -g vercel
```

✓ `node -v`, `pnpm -v`, `gh --version`, and `supabase --version` (or `pnpm dlx supabase --version`) all print versions, and you're inside the cloned `lifeos/` folder.

---

## Phase B — Supabase project + schema  *(~15 min)*
This is the part you asked about — **yes, create the project now**; it's the prerequisite for running the DDL and seed.

1. **[YOU]** Go to supabase.com → sign in → **New project**.
   - Org: personal · Name: `lifeos` · **DB password:** generate & save it in a password manager (you need it for CLI).
   - **Region:** pick closest — **Mumbai (ap-south-1)** or Singapore. · Plan: **Free**.
2. **[YOU]** When it finishes provisioning, open **Project Settings → API** and copy three values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` / publishable key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` *(secret — server only)*
3. **Run the migration** (creates all tables + RLS) — pick one:
   - **[CODE/CLI]** from inside `lifeos/`:
     ```bash
     supabase login                              # opens a browser; or: pnpm dlx supabase login
     supabase link --project-ref <ref>           # paste the DB password from B1 when asked
     mkdir -p supabase/migrations
     # save [[05 - Database Migration (DDL)]] as supabase/migrations/0001_init.sql, then:
     supabase db push
     ```
     *(`<ref>` is the `xxxx` in `https://<ref>.supabase.co`, also shown under Project Settings → General.)*
   - **[YOU]** *or* paste the DDL into **SQL Editor → New query → Run**.
   - **[CLAUDE]** *or* ask me — I can apply it via the Supabase integration.
4. **[YOU] Create the single user** — **Authentication → Users → Add user** → your email + a password. *(Do this before seeding — the seed aborts if no user exists.)*
   - Also under **Authentication → Providers → Email**, you may **disable "Allow new sign-ups"** afterward (single-user app).
5. **Run the seeds** (insert your tracks/phases/items) — **[YOU]** paste [[06 - Seed Script]] (Gym + Diet) then `supabase/seed_study.sql` (Study) into the SQL Editor and Run, **or [CLAUDE]** ask me to run them. They must run **after** step 4.
6. **[YOU] Enable extensions** — **Database → Extensions** → enable **`pg_cron`** and **`pg_net`** (needed for the 10 PM job in Phase E).
7. **Verify** — run the verify query at the bottom of [[06 - Seed Script]].

✓ You see 3 tracks with their phases/sections/items; Study/Gym/Diet all populated (Study replaced SDE + FDE on 2026-07-06).

---

## Phase C — Keys & integrations  *(~10 min)*  **[YOU]**
1. **VAPID keys** (web push): `pnpm dlx web-push generate-vapid-keys`
   - Public → `NEXT_PUBLIC_VAPID_PUBLIC_KEY` · Private → `VAPID_PRIVATE_KEY`.
2. **Resend** (email backup): create account → **API Keys → Create** → `RESEND_API_KEY`.
   - For real sending, add & verify a domain (or use Resend's onboarding `onboarding@resend.dev` sender for testing). Set the `from:` in the Edge Function accordingly.
3. **CRON_SECRET:** invent a random string (`openssl rand -hex 24`) — guards the reminder endpoint.

✓ You have all values for the `.env.local` block in [[07 - App Skeleton]] §3.

---

## Phase D — Local app running  *(~20 min)*  **[CODE/CLI]**
1. Bootstrap the app (commands in [[07 - App Skeleton]] §1) and create the folders/files in §2–8.
2. Create **`.env.local`** with every value from Phases B–C.
3. Generate DB types: `pnpm dlx supabase gen types typescript --project-id <ref> --schema public > lib/types.ts`.
4. `pnpm dev` → open `http://localhost:3000` → log in with the user from Phase B.

✓ You log in and the dashboard renders your seeded tracks (toggling a checkbox persists on refresh).

---

## Phase E — Reminder function + schedule  *(~15 min)*
1. **[CODE/CLI]** Deploy the function: `supabase functions deploy evening-reminder` (code in [[07 - App Skeleton]] §9).
2. **[YOU/CLI]** Set its secrets:
   ```bash
   supabase secrets set VAPID_SUBJECT=mailto:f20220098@pilani.bits-pilani.ac.in \
     VAPID_PUBLIC_KEY=… VAPID_PRIVATE_KEY=… RESEND_API_KEY=… CRON_SECRET=… APP_URL=https://<your-vercel-url>
   ```
   *(`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.)*
3. **[YOU]** In SQL Editor, run the `cron.schedule(...)` block from [[07 - App Skeleton]] §9 (fill in your `<ref>` and `<CRON_SECRET>`). 16:30 UTC = 22:00 IST.
4. **Test now:** `curl -H "Authorization: Bearer <CRON_SECRET>" https://<ref>.functions.supabase.co/evening-reminder` → should return `ok` (or `already logged`).

✓ A row appears in `notification_log`; once subscribed, a push arrives.

---

## Phase F — Deploy to Vercel + install on iPhone  *(~15 min)*  **[YOU]**
1. Push the repo to GitHub.
2. **vercel.com → New Project → import `lifeos`.** Framework auto-detects Next.js.
3. **Environment Variables:** paste the same `.env.local` values (the `NEXT_PUBLIC_*` ones **and** the server-only secrets). Deploy.
4. Update `NEXT_PUBLIC_APP_URL` / the function's `APP_URL` to the real Vercel URL; redeploy the function if you changed `APP_URL`.
5. **On the iPhone (Safari):** open the Vercel URL → **Share → Add to Home Screen** → open the installed app → log in.
6. In the app, trigger the push-permission prompt (after install, on a tap) → **Allow**. This saves a `push_subscriptions` row.

✓ Installed PWA on the Home Screen; at 22:00 IST you get a push (and an email backup) deep-linking to `/capture`.

---

## What only you can do vs. what I can drive
| Task | Who |
|---|---|
| Create Supabase / Vercel / Resend / GitHub accounts & projects | **You** (signups, billing, dashboards) |
| Run the DDL migration, the seed, the verify query, type-gen | **You or me** (via the Supabase integration / CLI) |
| Generate VAPID keys, set `.env`, write app code | **You / CLI** (I can write the files; you run them) |
| Create the auth user, enable `pg_cron`/`pg_net`, set function secrets | **You** (dashboard) — I can prep the SQL |
| Add-to-Home-Screen + allow notifications on the iPhone | **You** (device-only) |

> Want me to start? I can (a) apply the DDL + run the seed against your project through the Supabase integration once it exists, and (b) generate the actual Next.js project files from [[07 - App Skeleton]]. Tell me which, and share the project ref (never the service-role key in chat — set that locally).

---

## Cost & limits sanity (from [[02 - System Architecture & Tech Stack]] §12)
All free: Supabase Free, Vercel Hobby, Resend free (≈30 emails/mo vs 3,000). Only caveat — a Free Supabase project **pauses after 7 days idle**; daily use + the nightly job keep it awake, and one "Restore" click revives it if it ever sleeps.
