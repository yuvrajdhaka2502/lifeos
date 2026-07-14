# LifeOS — Seed Script

Related: [[00 - LifeOS Overview]] · [[01 - PRD]] · [[03 - Database Schema]] · [[05 - Database Migration (DDL)]] · [[Seed - Study]] · [[Master_Roadmap]] · [[Fitness_Plan_v5_FatLoss_Physique]]

> One-time data seed: run **after** [[05 - Database Migration (DDL)]] and **after** the single account exists. Inserts the tracks and their phases → sections → items. Granularity is **fully detailed** (PRD §9): every `- [ ]` in the seed docs is a `track_item`. No `item_completions` rows are inserted — an empty period renders unchecked automatically.
>
> **2026-07-06 — SDE + FDE replaced by Study.** The original SDE/FDE seed in this doc was retired; `supabase/seed_study.sql` deletes those two tracks (they had zero completions/hours) and seeds the **Study** track from [[Master_Roadmap]]. The Gym + Diet SQL below is unchanged and still the source of record for those tracks.

## 0. What this script does (in one line)
Turns the static planning docs into live, editable database rows so the app has real content on first launch. After this runs once, everything is edited in-app; the script is never run again.

## Conventions locked here
- **Idempotency:** designed to run **once on an empty schema**. Re-running duplicates rows — guard with the `if exists` check at the top (aborts if `tracks` already has data).
- **`user_id`:** resolved to the one real account via `select id ... from auth.users limit 1`. If you run this in the Supabase SQL editor (service role), `auth.uid()` is null, so we set `user_id` explicitly from `v_user`.
- **Study items:** the task text (with any inline resource URLs **kept in the `title`**) — the `ChecklistItem` UI extracts the first URL into a resource chip; shared base URLs live in the **section title**. `note` is left for user detail.
- **Gym items:** prescribed `sets × reps` stay in the `title`; `note` = target muscle · rest. The progress fields `sets`/`reps`/`weight` are seeded **null** (user fills them after session 1; they then persist across weeks — PRD F4b).
- **Diet meal items:** planned food goes in `note`. **Weekly Protocol** multi-count items set `weekly_target` (7 for daily habits, 1 for weekly one-offs).
- **Study mapping** (2026-07-06): roadmap Blocks → phase pages, bold groups → sections, exit checks → final items, pinned *DSA Maintenance* + *Projects A1 & A2* panels — full rules in [[Seed - Study]] and in the header of `supabase/seed_study.sql`.

---

## The script
```sql
do $do$
declare
  v_user uuid;
  gym uuid; diet uuid;
  ph  uuid;   -- current phase
  sec uuid;   -- current section
begin
  -- ---- resolve the single user & guard against double-seeding ----
  select id into v_user from auth.users order by created_at limit 1;
  if v_user is null then
    raise exception 'No auth user found — create the account before seeding.';
  end if;
  if exists (select 1 from public.tracks where user_id = v_user) then
    raise exception 'Tracks already exist for this user — seed has already run. Aborting.';
  end if;

  -- ================================================================
  -- TRACK 1 · STUDY — seeded separately (2026-07-06)
  -- The Study track (which replaced SDE + FDE on 2026-07-06) is seeded
  -- by `supabase/seed_study.sql`, mapped from Master_Roadmap.md.
  -- Mapping rules: see [[Seed - Study]]. Run it AFTER this script.
  -- ================================================================

  -- ================================================================
  -- TRACK 3 · GYM  (panels, weekly)
  -- ================================================================
  insert into public.tracks (user_id, slug, name, layout, tracks_hours, source_doc, icon, color, accent, sort_order)
  values (v_user, 'gym', 'Gym', 'panels', false, 'Obsidian Main/Gym/Fitness_Plan_v5_FatLoss_Physique.md', 'dumbbell', '#FBBF24', '#FB7185', 3)
  returning id into gym;

  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, gym, 'This Week', 'Mon–Sun split · resets Monday', 'panel', 'weekly', 0) returning id into ph;

  -- Mon · PUSH
  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, gym, ph, 'Mon · PUSH — Chest + Shoulders + Triceps', 0) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, note, sort_order)
  select v_user, gym, ph, sec, t.title, t.note, t.ord from (values
    ('DB Bench Press (neutral grip) 4×10–12', 'Chest, front delts, triceps · rest 90s · wrist-friendly', 0),
    ('Seated DB Shoulder Press 4×10–12', 'Front + side delts · rest 90s · priority lift', 1),
    ('Incline DB Press 3×12', 'Upper chest, front delts · rest 75s', 2),
    ('DB Lateral Raises 4×15', 'Side delts (width) · rest 60s', 3),
    ('Cable Tricep Pushdown (rope) 3×12–15', 'Triceps · rest 60s · wrist-friendly', 4),
    ('Overhead DB Tricep Extension 3×12', 'Triceps (long head) · rest 60s', 5),
    ('Hanging Knee Raises 3×12', 'Lower abs / core · rest 45s', 6),
    ('Incline Treadmill Walk 12–15 min', 'Fat loss · speed 5–5.5, incline 8–10', 7)
  ) t(title, note, ord);

  -- Tue · PULL
  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, gym, ph, 'Tue · PULL — Back + Biceps + Rear Delts', 1) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, note, sort_order)
  select v_user, gym, ph, sec, t.title, t.note, t.ord from (values
    ('Lat Pulldown (wide grip) 4×10–12', 'Lats (back width) · rest 90s', 0),
    ('Seated Cable Row 4×10–12', 'Mid-back, lats · rest 90s · slow, squeeze', 1),
    ('One-Arm DB Row 3×12 each', 'Lats / mid-back · rest 75s', 2),
    ('Face Pulls 4×15', 'Rear delts, upper traps · rest 60s', 3),
    ('DB Bicep Curl 4×10–12', 'Biceps · rest 60s · 3-sec eccentric', 4),
    ('Hammer Curls 3×12', 'Brachialis + forearms/grip · rest 60s', 5),
    ('Farmer''s Walk 3×30 sec', 'Grip/forearms, traps, core · rest 60s', 6),
    ('Incline Treadmill Walk 12–15 min', 'Fat loss', 7)
  ) t(title, note, ord);

  -- Wed · LEGS + CORE
  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, gym, ph, 'Wed · LEGS + CORE', 2) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, note, sort_order)
  select v_user, gym, ph, sec, t.title, t.note, t.ord from (values
    ('Goblet / Barbell Squat 4×10', 'Quads, glutes · rest 90s · light first 2 wks', 0),
    ('Romanian Deadlift 3×10', 'Hamstrings, glutes, lower back · rest 90s · straps if grip fails', 1),
    ('Walking Lunges 3×12 each', 'Quads, glutes · rest 60s', 2),
    ('Leg Press 3×12–15', 'Quads, glutes · rest 75s', 3),
    ('Seated/Lying Leg Curl 3×12', 'Hamstrings (isolation) · rest 60s', 4),
    ('Standing Calf Raises 4×15', 'Calves · rest 45s', 5),
    ('Hanging Knee Raises 3×12', 'Lower abs · rest 45s', 6),
    ('Cable Woodchoppers 3×12 each', 'Obliques · rest 45s', 7),
    ('Plank 2×45 sec', 'Core / deep abs · rest 30s', 8)
  ) t(title, note, ord);

  -- Thu · OPTIONAL
  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, gym, ph, 'Thu · OPTIONAL — Core + Cardio + Mobility', 3) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, note, sort_order)
  select v_user, gym, ph, sec, t.title, t.note, t.ord from (values
    ('Incline Treadmill Walk 25–30 min', 'Fat loss (steady-state)', 0),
    ('Cable Crunches 3×15', 'Upper abs · rest 45s', 1),
    ('Side Plank 3×30 sec each', 'Obliques · rest 30s', 2),
    ('Bird Dog 3×10 each', 'Lower-back / core stability · rest 30s', 3),
    ('Pallof Press (cable) 3×10 each', 'Anti-rotation core · rest 30s', 4),
    ('Band Pull-Aparts 3×20', 'Rear delts / posture · rest 30s', 5),
    ('Foam roll + mobility flow 8–10 min', 'Recovery', 6)
  ) t(title, note, ord);

  -- Fri · SHOULDERS + ARMS
  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, gym, ph, 'Fri · SHOULDERS + ARMS', 4) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, note, sort_order)
  select v_user, gym, ph, sec, t.title, t.note, t.ord from (values
    ('Seated DB Shoulder Press 4×10–12', 'Front + side delts · rest 90s', 0),
    ('DB Lateral Raises 4×15', 'Side delts (width) · rest 60s', 1),
    ('Cable Lateral Raise 3×12–15', 'Side delts (constant tension) · rest 60s', 2),
    ('Reverse Pec Deck 3×15', 'Rear delts · rest 60s', 3),
    ('EZ-Bar Bicep Curl 4×10', 'Biceps · rest 60s · wrist-friendly bar', 4),
    ('Hammer Curls 3×12', 'Brachialis + forearms · rest 60s', 5),
    ('Cable Tricep Pushdown (rope) 3×12–15', 'Triceps · rest 60s', 6),
    ('Overhead Tricep Extension 3×12', 'Triceps (long head) · rest 60s', 7),
    ('Incline Treadmill Walk 12–15 min', 'Fat loss', 8)
  ) t(title, note, ord);

  -- Sat · UPPER HYPERTROPHY
  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, gym, ph, 'Sat · UPPER HYPERTROPHY — Back + Chest + Rear Delts', 5) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, note, sort_order)
  select v_user, gym, ph, sec, t.title, t.note, t.ord from (values
    ('Assisted Pull-ups 4×6–8', 'Lats, biceps · rest 90s · goal: unassisted by Wk 6–7', 0),
    ('Chest-Supported Row 4×12', 'Mid-back, lats · rest 75s · no lower-back stress', 1),
    ('Lat Pulldown (close/neutral grip) 3×12', 'Lats (width + thickness) · rest 75s', 2),
    ('Incline DB Press 3×12', 'Upper chest, front delts · rest 75s', 3),
    ('Cable / Machine Chest Fly 3×15', 'Chest (stretch + squeeze) · rest 60s', 4),
    ('Reverse Pec Deck 3×15', 'Rear delts · rest 45s', 5),
    ('Dead Hangs 3×max time', 'Grip / forearms + decompression · rest 60s', 6),
    ('Incline Treadmill Walk 12–15 min', 'Fat loss', 7)
  ) t(title, note, ord);

  -- Sun · REST
  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, gym, ph, 'Sun · FULL REST / Light Walk', 6) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, note, sort_order)
  select v_user, gym, ph, sec, t.title, t.note, t.ord from (values
    ('Easy 30–40 min walk (outdoor preferred)', 'Active recovery', 0),
    ('Full-body foam roll 10 min + mobility flow 10 min', 'Recovery', 1),
    ('Deep breathing 5 min', 'Down-regulate before a late night', 2)
  ) t(title, note, ord);

  -- ================================================================
  -- TRACK 4 · DIET  (panels: daily meals + weekly protocol)
  -- ================================================================
  insert into public.tracks (user_id, slug, name, layout, tracks_hours, source_doc, icon, color, accent, sort_order)
  values (v_user, 'diet', 'Diet', 'panels', false, 'Obsidian Main/Gym/Fitness_Plan_v5_FatLoss_Physique.md', 'salad', '#34D399', '#A3E635', 4)
  returning id into diet;

  -- Daily Meals (daily)
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, diet, 'Daily Meals', '7 slots · resets daily', 'panel', 'daily', 0) returning id into ph;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, note, sort_order)
  select v_user, diet, ph, null, t.title, t.note, t.ord from (values
    ('Breakfast', 'Protein breakfast (~40 g) + multivitamin & D3 — e.g. Greek-yogurt bowl + whey, or tofu/paneer scramble', 0),
    ('Small meal', '1 fruit + roasted chana (30 g), or unsweetened lassi + peanuts; green tea/coffee', 1),
    ('Lunch', 'Dal/rajma/chole + soya chunks (60 g dry) or paneer/tofu + rotis/brown rice + salad + curd + omega-3 (~40–45 g)', 2),
    ('Pre-workout', '~3:45 PM — 1 banana + black coffee + 5–6 almonds + 2 walnuts + 5 g creatine', 3),
    ('Post-workout', '~6 PM — 1 scoop whey + 1 banana or date', 4),
    ('Snack', 'Greek yogurt + nuts, or sprouts chaat, or 50 g paneer + green tea, or roasted chana/makhana', 5),
    ('Dinner', 'Biggest meal (~40 g) — paneer tikka / bhurji / soya pulao + veg + rotis or rice + curd', 6)
  ) t(title, note, ord);

  -- Weekly Protocol (weekly, multi-count)
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, diet, 'Weekly Protocol', 'Make-or-break habits · resets Monday', 'panel', 'weekly', 1) returning id into ph;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, note, weekly_target, sort_order)
  select v_user, diet, ph, null, t.title, t.note, t.tgt, t.ord from (values
    ('Hit 150 g protein', '~2 g/kg — non-negotiable', 7, 0),
    ('8–10k steps', '10-min walk after lunch & dinner counts', 7, 1),
    ('Daily supplements — creatine/whey/B12/D3/omega-3', 'Per the supplement protocol', 7, 2),
    ('10-min walk after lunch & dinner', 'Real belly-fat work', 7, 3),
    ('No match-night junk', 'Water / green tea / black coffee only', 7, 4),
    ('Sunday meal prep', 'Soak/boil rajma & chole, marinate paneer/tofu, portion soya, prep oats', 1, 5),
    ('Sunday weigh-in + waist + photos', 'Same scale/light; total-sleep estimate + adherence %', 1, 6)
  ) t(title, note, tgt, ord);

  raise notice 'LifeOS seed complete for user %', v_user;
end
$do$;
```

---

## Verify after running
```sql
select t.slug, count(distinct p.id) phases, count(distinct s.id) sections, count(i.id) items
from public.tracks t
left join public.track_phases   p on p.track_id = t.id
left join public.track_sections s on s.phase_id = p.id
left join public.track_items    i on i.phase_id = p.id
group by t.slug order by t.slug;
```
Expected (verified live 2026-07-06): **study** 19 phases / 47 sections / 187 items · **gym** 1 phase / 7 sections / 52 items · **diet** 2 phases / 0 sections / 14 items.

## Notes for later
- A `track_hours` / `daily_logs` / `todos` row is **not** seeded — those start empty and are created by the app on first use.
- To re-seed during development: `delete from public.tracks where user_id = '<id>';` (cascades to phases/sections/items/completions), then re-run this script + `supabase/seed_study.sql`. (The Study seed guards itself — it aborts if a `study` track already exists.)
