# LifeOS — Database Migration (DDL)

Related: [[00 - LifeOS Overview]] · [[01 - PRD]] · [[02 - System Architecture & Tech Stack]] · [[03 - Database Schema]]

> Executable Postgres / Supabase migration for the schema in [[03 - Database Schema]]. Single user; **RLS on every table** (`user_id = auth.uid()`, `profiles.id = auth.uid()`). Week starts **Monday**; `date` columns interpreted in **IST** by the app. Seeding (track/phase/section/item content) is a **separate step** — see §9.

## Conventions (decisions locked here)
- **PKs:** `uuid` via `gen_random_uuid()`. **FKs:** `on delete cascade` down the ownership tree (`auth.users → tracks → phases → sections/items → completions`); `track_items.section_id` is `on delete set null` (deleting a section keeps its items, just un-grouped).
- **`user_id`** is `not null default auth.uid()` on every owned table, so app inserts don't have to pass it and RLS still holds.
- **Soft-delete** via `is_active = false` (preserves completion history) — hard deletes are avoided in-app but the cascades above are correct if one ever happens.
- **Timestamps:** `timestamptz` default `now()`; `updated_at` maintained by a trigger (only on tables that have it).
- **Run order:** execute the sections **top to bottom** — concatenated, they are one idempotent-ish migration (objects use `if not exists` where Postgres allows it; enums/policies do not, so run once on a clean DB).
- For Supabase CLI, paste this as a single `supabase/migrations/<timestamp>_init.sql`.

---

## 1. Extensions
```sql
create extension if not exists pgcrypto;   -- gen_random_uuid()
```

## 2. Enums
```sql
create type track_layout  as enum ('phased', 'panels');
create type phase_layout  as enum ('phase', 'pinned', 'panel');
create type period_scope  as enum ('static', 'weekly', 'daily');
create type urgency_level as enum ('low', 'medium', 'high', 'urgent');
```

## 3. Helper — `updated_at` trigger function
```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

---

## 4. Tables (in dependency order)

### 4.1 `profiles`
```sql
create table public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  display_name         text,
  timezone             text        not null default 'Asia/Kolkata',
  reminder_enabled     boolean     not null default true,
  reminder_time        time        not null default '22:00',
  email_backup_enabled boolean     not null default true,
  week_starts_on       smallint    not null default 1 check (week_starts_on between 0 and 6),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
```

### 4.2 `push_subscriptions`
```sql
create table public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  endpoint     text        not null unique,
  p256dh       text        not null,
  auth         text        not null,
  user_agent   text,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz not null default now()
);
```

### 4.3 `tracks`
```sql
create table public.tracks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid          not null default auth.uid() references auth.users(id) on delete cascade,
  slug         text          not null,                 -- 'study' | 'gym' | 'diet'
  name         text          not null,
  layout       track_layout  not null,                 -- 'phased' (Study) | 'panels' (Gym/Diet)
  tracks_hours boolean       not null default false,   -- true for Study
  source_doc   text,
  icon         text,
  color        text,
  accent       text,
  sort_order   int           not null default 0,
  is_active    boolean       not null default true,
  created_at   timestamptz   not null default now(),
  unique (user_id, slug)
);
```

### 4.4 `track_phases`
```sql
create table public.track_phases (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid          not null default auth.uid() references auth.users(id) on delete cascade,
  track_id     uuid          not null references public.tracks(id) on delete cascade,
  title        text          not null,
  subtitle     text,
  layout       phase_layout  not null,                 -- 'phase' | 'pinned' | 'panel'
  period_scope period_scope  not null,                 -- 'static' | 'weekly' | 'daily'
  sort_order   int           not null default 0,
  is_active    boolean       not null default true,
  created_at   timestamptz   not null default now()
);
```

### 4.5 `track_sections`
```sql
create table public.track_sections (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  track_id   uuid        not null references public.tracks(id) on delete cascade,
  phase_id   uuid        not null references public.track_phases(id) on delete cascade,
  title      text        not null,
  sort_order int         not null default 0,
  is_active  boolean     not null default true,
  created_at timestamptz not null default now()
);
```

### 4.6 `track_items`
Includes the **gym progress fields** `sets` / `reps` / `weight` (PRD F4b) — persistent item state, never period-keyed.
```sql
create table public.track_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  track_id      uuid        not null references public.tracks(id) on delete cascade,        -- denormalized
  phase_id      uuid        not null references public.track_phases(id) on delete cascade,  -- drives period scope
  section_id    uuid        references public.track_sections(id) on delete set null,
  title         text        not null,
  note          text,                                          -- resource link / planned food / detail
  sets          smallint    check (sets >= 0),                 -- Gym only · last session · nullable
  reps          smallint    check (reps >= 0),                 -- Gym only · last session · nullable
  weight        text,                                          -- Gym only · note-like ('60kg','BW+10kg') · nullable
  weekly_target int         not null default 1 check (weekly_target >= 1),
  sort_order    int         not null default 0,
  is_active     boolean     not null default true,
  created_at    timestamptz not null default now()
);
```

### 4.7 `item_completions`
```sql
create table public.item_completions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  item_id         uuid        not null references public.track_items(id) on delete cascade,
  track_id        uuid        not null references public.tracks(id) on delete cascade,        -- denormalized
  phase_id        uuid        not null references public.track_phases(id) on delete cascade,  -- denormalized
  period_key      text        not null,                         -- 'static' | 'YYYY-MM-DD' (Monday/day, IST)
  completed       boolean     not null default true,
  completed_count int         not null default 1 check (completed_count >= 0),
  completed_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (item_id, period_key)                                  -- idempotent toggling
);
```

### 4.8 `track_hours`
```sql
create table public.track_hours (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid          not null default auth.uid() references auth.users(id) on delete cascade,
  track_id   uuid          not null references public.tracks(id) on delete cascade,
  log_date   date          not null,                            -- IST date
  hours      numeric(4,2)  not null default 0 check (hours >= 0),
  created_at timestamptz   not null default now(),
  updated_at timestamptz   not null default now(),
  unique (track_id, log_date)
);
```

### 4.9 `daily_logs`
```sql
create table public.daily_logs (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  log_date          date        not null,                       -- IST date
  rating            smallint    check (rating between 1 and 5),
  diet_satisfaction smallint    check (diet_satisfaction between 1 and 3),
  diary             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (user_id, log_date)
);
```

### 4.10 `todos`
```sql
create table public.todos (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid          not null default auth.uid() references auth.users(id) on delete cascade,
  title        text          not null,
  urgency      urgency_level not null default 'medium',
  due_date     date,
  completed    boolean       not null default false,
  completed_at timestamptz,
  sort_order   int           not null default 0,
  created_at   timestamptz   not null default now()
);
```

### 4.11 `notification_log`
```sql
create table public.notification_log (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  kind          text        not null default 'evening_reminder',
  sent_for_date date        not null,                           -- IST date
  channels      text[]      not null default '{}',              -- e.g. {push,email}
  sent_at       timestamptz not null default now(),
  unique (user_id, kind, sent_for_date)                         -- one reminder per kind per day
);
```

---

## 5. Indexes
The `unique (...)` constraints above already create indexes for `(item_id, period_key)`, `(track_id, log_date)`, `(user_id, log_date)`, `push_subscriptions(endpoint)`, `tracks(user_id, slug)`, and `(user_id, kind, sent_for_date)`. Remaining read-path indexes:
```sql
create index idx_completions_phase_period on public.item_completions (phase_id, period_key);  -- phase progress
create index idx_completions_track_period on public.item_completions (track_id, period_key);  -- track totals / last-week score
create index idx_phases_track_layout_sort on public.track_phases  (track_id, layout, sort_order); -- phase nav + pinned panels
create index idx_items_phase_section_sort on public.track_items   (phase_id, section_id, sort_order); -- render a phase page
create index idx_hours_track_date_desc    on public.track_hours   (track_id, log_date desc);   -- hours rollups
create index idx_todos_user_done_urgency  on public.todos         (user_id, completed, urgency); -- to-do grouping
```

## 6. `updated_at` triggers
Only the four tables that carry an `updated_at` column:
```sql
create trigger trg_profiles_updated         before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_item_completions_updated before update on public.item_completions
  for each row execute function public.set_updated_at();
create trigger trg_track_hours_updated      before update on public.track_hours
  for each row execute function public.set_updated_at();
create trigger trg_daily_logs_updated       before update on public.daily_logs
  for each row execute function public.set_updated_at();
```

---

## 7. Row-Level Security
Enable RLS on every table, then one `for all` policy per table scoped to the owner. (`to authenticated` so the anon role is denied outright.) The reminder Edge Function uses the **service-role key**, which bypasses RLS — no policy needed for it.

```sql
-- enable
alter table public.profiles           enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.tracks             enable row level security;
alter table public.track_phases       enable row level security;
alter table public.track_sections     enable row level security;
alter table public.track_items        enable row level security;
alter table public.item_completions   enable row level security;
alter table public.track_hours        enable row level security;
alter table public.daily_logs         enable row level security;
alter table public.todos              enable row level security;
alter table public.notification_log   enable row level security;

-- profiles keys on id; every other table keys on user_id
create policy own_profile on public.profiles
  for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy own_rows on public.push_subscriptions
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_rows on public.tracks
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_rows on public.track_phases
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_rows on public.track_sections
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_rows on public.track_items
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_rows on public.item_completions
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_rows on public.track_hours
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_rows on public.daily_logs
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_rows on public.todos
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_rows on public.notification_log
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
```

## 8. Auto-create `profiles` row on signup (optional but recommended)
So a profile exists the moment the single account is created:
```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

---

## 9. Seeding (separate step — not part of this DDL)
After the account exists, a one-time seed inserts the tracks → phases → sections → items. Granularity is **locked to fully detailed** (PRD §9): every `- [ ]` in the source plan → one `track_item`; every bold sub-heading → one `track_section`. Mapping (Study replaced SDE + FDE on 2026-07-06 — see [[Seed - Study]]):

| Track | `tracks` | `track_phases` | Scope |
|---|---|---|---|
| **Study** | `phased`, `tracks_hours=true` | Block 1…15 + Phase 4 + Phase 5 (`phase`) + *DSA Maintenance* (`pinned`) + *Projects A1 & A2* (`pinned`) | all `static` |
| **Gym** | `panels` | *This Week* (`panel`) — sections Mon…Sun | `weekly` |
| **Diet** | `panels` | *Daily Meals* (`panel`) + *Weekly Protocol* (`panel`) | `daily` + `weekly` |

Notes for the seed script:
- **Gym** exercise items: leave `sets` / `reps` / `weight` = `null` (user fills them after the first session; they then persist across weeks).
- **Diet** meal items: prescribed food goes in `note`; **Weekly Protocol** multi-count items set `weekly_target` (protein/steps/supplements/walks/no-junk = `7`, meal-prep & weigh-in = `1`).
- **Gym** multi-count items (e.g. cardio 2×): set `weekly_target` accordingly.
- No `item_completions` rows are seeded — empty period ⇒ renders unchecked automatically.

> Concrete `insert` statements: **[[06 - Seed Script]]** (Gym + Diet) and **`supabase/seed_study.sql`** (Study).
