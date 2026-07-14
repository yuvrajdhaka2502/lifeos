create extension if not exists pgcrypto;   -- gen_random_uuid()

create type track_layout  as enum ('phased', 'panels');
create type phase_layout  as enum ('phase', 'pinned', 'panel');
create type period_scope  as enum ('static', 'weekly', 'daily');
create type urgency_level as enum ('low', 'medium', 'high', 'urgent');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

create table public.tracks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid          not null default auth.uid() references auth.users(id) on delete cascade,
  slug         text          not null,                 -- 'sde' | 'fde' | 'gym' | 'diet'
  name         text          not null,
  layout       track_layout  not null,                 -- 'phased' (SDE/FDE) | 'panels' (Gym/Diet)
  tracks_hours boolean       not null default false,   -- true for SDE/FDE
  source_doc   text,
  icon         text,
  color        text,
  accent       text,
  sort_order   int           not null default 0,
  is_active    boolean       not null default true,
  created_at   timestamptz   not null default now(),
  unique (user_id, slug)
);

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

create table public.notification_log (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  kind          text        not null default 'evening_reminder',
  sent_for_date date        not null,                           -- IST date
  channels      text[]      not null default '{}',              -- e.g. {push,email}
  sent_at       timestamptz not null default now(),
  unique (user_id, kind, sent_for_date)                         -- one reminder per kind per day
);

create index idx_completions_phase_period on public.item_completions (phase_id, period_key);  -- phase progress
create index idx_completions_track_period on public.item_completions (track_id, period_key);  -- track totals / last-week score
create index idx_phases_track_layout_sort on public.track_phases  (track_id, layout, sort_order); -- phase nav + pinned panels
create index idx_items_phase_section_sort on public.track_items   (phase_id, section_id, sort_order); -- render a phase page
create index idx_hours_track_date_desc    on public.track_hours   (track_id, log_date desc);   -- hours rollups
create index idx_todos_user_done_urgency  on public.todos         (user_id, completed, urgency); -- to-do grouping

create trigger trg_profiles_updated         before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_item_completions_updated before update on public.item_completions
  for each row execute function public.set_updated_at();
create trigger trg_track_hours_updated      before update on public.track_hours
  for each row execute function public.set_updated_at();
create trigger trg_daily_logs_updated       before update on public.daily_logs
  for each row execute function public.set_updated_at();

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


