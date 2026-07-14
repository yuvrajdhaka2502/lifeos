# LifeOS — Database Schema

Related: [[00 - LifeOS Overview]] · [[01 - PRD]] · [[02 - System Architecture & Tech Stack]] · [[04 - Frontend & UI]]

> Postgres (Supabase). Single user; every table carries `user_id` and is protected by RLS (`user_id = auth.uid()`). Schema described as tables here; **executable DDL in [[05 - Database Migration (DDL)]]**. Week starts **Monday**; dates interpreted in **IST**.

---

## 1. Hierarchy & key idea
```
auth.users
   ├──< profiles            (settings, push prefs, timezone)
   ├──< push_subscriptions  (per-device push endpoints)
   ├──< daily_logs          (1 per date: rating + diet satisfaction + diary)
   ├──< todos               (general list — the 4th tile)
   ├──< track_hours         (per-day hours for Study)
   └──< tracks              (Study / Gym / Diet)
            └──< track_phases     (navigable pages OR pinned/panel blocks)
                     ├──< track_sections   (optional sub-headings)
                     └──< track_items      (checkable lines)
                              └──< item_completions  (period-keyed ticks)
```

**Two design choices that drive everything:**
1. **`track_phases`** is the unit a track is split into. A phase has a **`layout`** (`phase` = a page you navigate next/prev · `pinned` = always-visible panel · `panel` = a standalone block) and a **`period_scope`** (`static` / `weekly` / `daily`) that decides how its items' completions are keyed.
2. **`item_completions.period_key`** is derived from the owning phase's `period_scope` — `'static'`, the week's Monday date, or the day's date. A fresh period simply has no rows yet → renders unchecked **automatically**. No generation job (see [[02 - System Architecture & Tech Stack]] §3).

**How each track maps** (Study replaced SDE + FDE on 2026-07-06):
| Track | tracks.layout | Phases |
|---|---|---|
| **Study** | `phased` | `phase`×17 (Block 1…15 + Phase 4 + Phase 5, static) + `pinned`: *DSA Maintenance* (static), *Projects A1 & A2* (static) |
| **Gym** | `panels` | `panel`: *This Week* (weekly) |
| **Diet** | `panels` | `panel`: *Daily Meals* (daily) + `panel`: *Weekly Protocol* (weekly) |

---

## 2. Tables

### `profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | = `auth.users.id` |
| `display_name` | text | optional |
| `timezone` | text | default `'Asia/Kolkata'` |
| `reminder_enabled` | boolean | default `true` |
| `reminder_time` | time | default `22:00` (IST) |
| `email_backup_enabled` | boolean | default `true` |
| `week_starts_on` | smallint | default `1` (Monday) |
| `created_at` / `updated_at` | timestamptz | |

### `push_subscriptions`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) · `user_id` uuid (FK) | |
| `endpoint` | text (unique) | |
| `p256dh` / `auth` | text | subscription keys |
| `user_agent` | text | identify device |
| `created_at` / `last_used_at` | timestamptz | prune on 404/410 |

### `tracks`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) · `user_id` uuid (FK) | |
| `slug` | text | `'study' / 'gym' / 'diet'` (unique per user) |
| `name` | text | display name |
| `layout` | enum `track_layout` | `'phased'` (Study) or `'panels'` (Gym/Diet) — UI render mode |
| `tracks_hours` | boolean | `true` for Study → daily hours logging |
| `source_doc` | text | vault path of the seed plan (reference) |
| `icon` / `color` / `accent` | text | tile + page theming |
| `sort_order` | int | tile order on the dashboard |
| `is_active` | boolean | default `true` |

`enum track_layout = { phased, panels }`
> The **General To-Do** (4th tile) is **not** a track — it lives in `todos`.

### `track_phases`
The navigable/pinned/panel units inside a track.
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) · `user_id` uuid (FK) | |
| `track_id` | uuid (FK → tracks) | |
| `title` | text | "Block 3 — Graphs I (BFS/DFS/Matrix/Topo) · Networking", "DSA Maintenance", "Daily Meals", "Weekly Protocol" |
| `subtitle` | text | optional, e.g. "Phase 1 — Rebuild the Gate" |
| `layout` | enum `phase_layout` | `'phase'` (navigated) · `'pinned'` (always-visible panel) · `'panel'` (standalone block) |
| `period_scope` | enum `period_scope` | `'static'` / `'weekly'` / `'daily'` → drives `period_key` for its items |
| `sort_order` | int | navigation order for `phase`; display order otherwise |
| `is_active` | boolean | default `true` |
| `created_at` | timestamptz | |

`enum phase_layout = { phase, pinned, panel }` · `enum period_scope = { static, weekly, daily }`

### `track_sections`
Optional sub-headings inside a phase (e.g. "0.1 Operating Systems", or a Gym day "Push Day").
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) · `user_id` uuid (FK) | |
| `track_id` | uuid (FK) · `phase_id` | uuid (FK → track_phases) |
| `title` | text | |
| `sort_order` | int · `is_active` boolean | |

### `track_items`
The editable checkable lines.
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) · `user_id` uuid (FK) | |
| `track_id` | uuid (FK) | denormalized for fast queries |
| `phase_id` | uuid (FK → track_phases) | **required** (drives period scope) |
| `section_id` | uuid (FK → track_sections) | nullable |
| `title` | text | "Solve LRU Cache", "Breakfast", "Hit 150 g protein", "Seated DB Shoulder Press 4×12" |
| `note` | text | user detail (Study), planned food (Diet meal), or target muscle · rest (Gym). **Unrelated to the gym progress fields below.** |
| `sets` | smallint | nullable; **Gym only** — sets done last session. `check (sets >= 0)` |
| `reps` | smallint | nullable; **Gym only** — reps done last session. `check (reps >= 0)` |
| `weight` | text | nullable; **Gym only** — note-like weight (e.g. `"60kg"`, `"BW+10kg"`, `"red band"`) — free text so units/bodyweight/bands fit |
| `weekly_target` | int | default `1`; for multi-count items (protein 7×, cardio 2×) in weekly/daily phases |
| `sort_order` | int · `is_active` boolean | soft-delete preserves history |
| `created_at` | timestamptz | |

> **Gym progress fields (`sets` / `reps` / `weight`)** record what was lifted *last time* so the user can chase progressive overload. They live **on the item itself** (not in `item_completions`), so they are **persistent** — the weekly completion refresh never touches them; they change **only when the user edits them** (PRD F4b). `null` on every non-gym item and on a freshly-seeded gym item.

### `item_completions`
One row per (item, period). `period_key` is computed from the item's phase `period_scope`.
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) · `user_id` uuid (FK) | |
| `item_id` | uuid (FK → track_items) · `track_id` uuid (FK) | denormalized |
| `phase_id` | uuid (FK → track_phases) | denormalized for fast phase progress |
| `period_key` | text | `'static'` · `'YYYY-MM-DD'` Monday (weekly) · `'YYYY-MM-DD'` day (daily) |
| `completed` | boolean | default `true` |
| `completed_count` | int | default `1`; for `weekly_target > 1` |
| `completed_at` / `updated_at` | timestamptz | |

**Uniqueness:** `(item_id, period_key)` — idempotent toggling.

### `track_hours`
Per-day hours for hours-enabled tracks (Study). Default 0.
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) · `user_id` uuid (FK) · `track_id` uuid (FK) | |
| `log_date` | date | IST date |
| `hours` | numeric(4,2) | default `0` (decimal hours, e.g. 3.50) |
| `created_at` / `updated_at` | timestamptz | |

**Uniqueness:** `(track_id, log_date)`.

### `daily_logs`
One record per date: rating + diet satisfaction + diary.
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) · `user_id` uuid (FK) | |
| `log_date` | date | IST date; **unique per user** |
| `rating` | smallint | 1–5, nullable; `check (rating between 1 and 5)` |
| `diet_satisfaction` | smallint | 1–3, nullable; 1 junk/skipped · 2 minor deviation · 3 ideal |
| `diary` | text | nullable |
| `created_at` / `updated_at` | timestamptz | |

### `todos` (General To-Do — 4th tile)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) · `user_id` uuid (FK) | |
| `title` | text · `urgency` enum `urgency_level` | `low / medium / high / urgent` |
| `due_date` | date (nullable) · `completed` boolean · `completed_at` timestamptz | |
| `sort_order` | int · `created_at` timestamptz | |

`enum urgency_level = { low, medium, high, urgent }`

### `notification_log` (recommended)
| Column | Type | Notes |
|---|---|---|
| `id` · `user_id` | uuid | |
| `kind` | text | `'evening_reminder'` |
| `sent_for_date` | date | unique with `(user_id, kind)` |
| `channels` | text[] · `sent_at` timestamptz | `{push, email}` |

---

## 3. Indexes (planned)
- unique `item_completions (item_id, period_key)`; `item_completions (phase_id, period_key)` — phase progress; `(track_id, period_key)` — track totals/scores.
- `track_phases (track_id, layout, sort_order)` — render phase nav + pinned panels.
- `track_items (phase_id, section_id, sort_order)` — render a phase page.
- unique `track_hours (track_id, log_date)`; `(track_id, log_date desc)` — hours rollups.
- unique `daily_logs (user_id, log_date)`; `todos (user_id, completed, urgency)`; unique `push_subscriptions (endpoint)`.

---

## 4. Behavior by phase `period_scope`
- **static** (Study phases, DSA Maintenance, Projects): `period_key='static'` → one persistent tick per item; never resets. Phase progress = completed/total active items in that phase.
- **weekly** (Gym *This Week*, Diet *Weekly Protocol*): `period_key=<this Monday>`. New week → unchecked. **Last-week score** = completed for `<last Monday>`. Multi-count via `completed_count` vs `weekly_target`.
- **daily** (Diet *Daily Meals*): `period_key=<today>`. New day → 7 meal slots unchecked. Tile = `count(completed)/7`.
- Editing items/sections never mutates past periods (history preserved); removal = `is_active=false`.
- **Diet satisfaction** (1–3) is per-day on `daily_logs`, independent of completions.
- **Gym progress (`sets`/`reps`/`weight`)** is **persistent item state**, *not* period-keyed: the Monday weekly refresh resets only `item_completions` ticks, leaving these three fields untouched. They carry forward week-to-week until the user edits them (PRD F4b). No history rows — a single current value per item.

---

## 5. Sample query intents
- **Study phase page:** items where `phase_id=P` (grouped by section) + completions where `period_key='static'`; phase progress bar.
- **Study tile:** overall static progress across phases + Σ `track_hours` this week + today's hours + "current block."
- **Gym tile:** this-week completed `/ total` + last-week completed.
- **Diet tile:** today's meals `count/7` + today's `diet_satisfaction`; Weekly-Protocol mini-progress.
- **Calendar month:** `daily_logs` in range → color by `rating`. **Weekly avg:** `avg(rating)` where `rating not null`.
- **Evening capture (F7):** upsert `daily_logs(rating, diary, diet_satisfaction)` + `track_hours` for Study, for today.

---

## 6. RLS (all tables)
- RLS enabled everywhere; policy `user_id = auth.uid()` (`profiles`: `id = auth.uid()`).
- Reminder Edge Function uses the service-role key (bypasses RLS) only to check "is today logged?" and send notifications.

---

## 7. Seed plan
On first run insert tracks, their `track_phases`, `track_sections`, and `track_items`:
- **Study** (`phased`, hours) — 17 phase pages (Block 1…15 + Phase 4 + Phase 5) from [[Master_Roadmap]] per the mapping in [[Seed - Study]] + pinned **DSA Maintenance** and **Projects A1 & A2**. SQL: `supabase/seed_study.sql` (replaced the SDE/FDE seed 2026-07-06).
- **Gym** (`panels`, weekly) — *This Week* panel, sections Mon–Sun with exercises. Each exercise item seeds with `sets`/`reps`/`weight` = `null` (the user fills them in after the first session; they then persist across weeks).
- **Diet** (`panels`) — *Daily Meals* panel (7 meal items, planned-food notes) + *Weekly Protocol* panel (see below).
All editable in-app; the app does not re-sync from the docs.

**Diet → Weekly Protocol seed items** (period_scope `weekly`, from [[Fitness_Plan_v5_FatLoss_Physique]]):
- Hit 150 g protein (`weekly_target 7`)
- 8–10k steps (`weekly_target 7`)
- Daily supplements — creatine/whey/B12/D3/omega-3 (`weekly_target 7`)
- 10-min walk after lunch & dinner (`weekly_target 7`)
- Sunday meal prep (1×)
- No match-night junk (`weekly_target 7`)
- Sunday weigh-in + waist + photos (1×)

---

## 8. Confirmed / open
- [x] Decimal hours · Monday week start · Gym+Diet two tiles · Diet daily + 1–3 satisfaction. **Confirmed.**
- [x] Study split into **phase pages** + pinned **DSA Maintenance**/**Projects A1 & A2**. **Confirmed.**
- [x] Diet **Weekly Protocol** sub-panel added. **Confirmed.**
- [x] **Gym per-exercise progress** = three persistent item columns `sets` (smallint), `reps` (smallint), `weight` (text/note-like), separate from `note`, never reset by the weekly refresh. **Confirmed.**
- [x] **SDE + FDE → Study** (2026-07-06): pure data change — no DDL needed; 17 phase pages + 2 pinned panels, 187 items, single hours stream. Verified live. **Confirmed.**
