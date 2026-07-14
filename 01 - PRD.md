# LifeOS — Product Requirements Document (PRD)

Related: [[00 - LifeOS Overview]] · [[02 - System Architecture & Tech Stack]] · [[03 - Database Schema]]
Source plans: [[Master_Roadmap]] · [[Fitness_Plan_v5_FatLoss_Physique]]

> **2026-07-06 revision:** the separate **SDE** and **FDE** tracks were removed and replaced by a single **Study** track seeded from [[Master_Roadmap]] (see [[Seed - Study]]). The dashboard is now **4 tiles** and the evening prompt collects **one** Study-hours value.

---

## 1. Vision & problem
I'm running several long, structured efforts in parallel — the Master Roadmap (my complete SDE+AI job-switch plan), an 8-week fitness plan, and its diet — plus everyday small tasks. They live in long docs I don't open daily. I want **one screen** that turns those plans into living checklists, makes me log effort (hours) and reflect (rating + diary) every night, and nudges me at 10 PM so the habit actually sticks.

## 2. Goals
- **G1** — One dashboard with four tiles summarizing everything at a glance.
- **G2** — Turn my static plans (Study/Gym/Diet) into editable, checkable lists without losing the plan's structure.
- **G3** — Track **daily hours** on Study (the roadmap is part-time around a job; hours make the effort visible).
- **G4** — A nightly loop: rate the day (1–5), journal, and log Study hours — in under a minute.
- **G5** — A 10 PM reminder that reliably reaches my iPhone.
- **G6** — $0/month (free tiers), usable on laptop + iPhone browser.

## 3. Non-goals (v1)
- Multi-user / sharing.
- Native apps (PWA only).
- Auto-importing/parsing the plan docs on every change (seeded once, then edited in-app).
- External integrations (LeetCode, GitHub, fitness trackers, calendars).
- Analytics beyond weekly rating average, last-week track score, and an hours view.

## 4. Core concepts (glossary)
- **Track** — a long-running focus area. Three tracks: **Study** (phased + hours), **Gym** (weekly), **Diet** (daily meals + weekly protocol).
- **Phase** — a unit a track is split into, with one of three layouts:
  - **Phase page** (Study: Blocks 1–15 + Phase 4 + Phase 5 = 17 pages) — a page you **navigate** through (next/previous), with checkboxes. Persistent ticks (no reset).
  - **Pinned panel** (Study: *DSA Maintenance* + *Projects A1 & A2*) — **always visible** alongside whichever phase page you're on. Persistent ticks.
  - **Panel** (Gym *This Week*, Diet *Daily Meals* + *Weekly Protocol*) — a standalone block on a simple (non-phased) track page.
- **Period scope** — how a phase's ticks are keyed: **static** (permanent, Study), **weekly** (resets Monday, Gym + Diet protocol), **daily** (resets each day, Diet meals).
- **Hours** — per-day decimal hours logged on Study.
- **Diet satisfaction** — a daily 1–3 score (1 junk/skipped · 2 minor deviation · 3 ideal).
- **Section** — an optional heading that groups items within a track (e.g. "DSA — Graphs I", "Push Day", "Daily Protein"). Editable.
- **Track item** — one checkable line in a track (e.g. "Solve LRU Cache", "Seated DB Shoulder Press 4×12"). Editable.
- **Daily log** — one record per date: star rating + diary text.
- **Track hours** — per-day hours logged against a track (Study), default 0.
- **Todo** — a one-off miscellaneous task with an urgency level (the 5th tile).

---

## 5. Features

### F1 — Main Dashboard (4 tiles)
**Story:** I open the app and see all four areas at a glance.

A row/grid of **four tiles**:
1. **Study** (phased) — current block + overall progress, **hours this week** (Σ) and **today's hours**.
2. **Gym** (weekly) — this week `4 / 7` + **last week: 6**.
3. **Diet** (daily) — today `5 / 7` meals + today's satisfaction (1–3); small 7-day satisfaction strip.
4. **General To-Do** — open count + urgent count.

Also on the dashboard: the **mini calendar** (F2) and a **"Rate today"** call-to-action if today isn't rated. Tapping any tile opens that area's full page.

**Acceptance criteria:**
- Exactly four tiles render with correct current numbers.
- The Study tile shows item progress + hours; Gym/Diet show this-week + last-week; To-Do shows open/urgent counts.
- Tapping a tile routes to its detail page.

### F2 — Mini Calendar (rating heatmap)
**Story:** See recent days colored by rating + this week's average.

- Month grid; each day colored by its 1–5 rating (5 buckets; un-rated = empty).
- Shows **this-week average** (mean over rated days only).
- Tap a day → open that day's rating + diary (+ that day's logged hours, read-only context).
- Prev/next month navigation.

**Acceptance criteria:**
- Colors map to the correct rating bucket; un-rated days excluded from the average.
- Tapping a past day opens its log for view/edit.

### F3 — General To-Do List (4th tile)
**Story:** A quick list for everyday one-off tasks, separate from the three tracks.

- Add / edit / complete / delete; each todo has title, **urgency** (Low / Medium / High / Urgent), optional due date.
- Opens as its own page; dashboard tile shows a preview (top urgent/open).
- Sorted/grouped by urgency; completed items de-emphasized or filterable.

**Acceptance criteria:**
- Create a todo with title + urgency in one action; urgent items surface first.
- This list is independent of all track data.

### F4 — Track pages (Study, Gym, Diet)
Pre-seeded by the system from the source plans; **every section and item is editable** (add / rename / reorder / remove), and sections can be added.

#### F4a — Study (phase pages + pinned panels + hours)
**Story:** I move through the Master Roadmap one block at a time, ticking tasks, while my DSA-maintenance and project deep-dive lists stay in view the whole time — and I log the hours I put in each day.

**Phase pages (navigable):**
- Study → **Block 1 … Block 15**, then **Phase 4 — Interview Loops** and **Phase 5 — Negotiate & Close** (**17 pages**). Each is its own page, seeded from [[Master_Roadmap]] per the mapping in [[Seed - Study]]: bold groups (DSA / Core CS / OYR / Job / Build / System design) become sections, every `- [ ]` a checkable task, each block's ✅ exit check the final item.
- **Navigation:** a phase **stepper** at the top (shows all pages + per-page % complete) plus **Next / Previous** controls; the active page is remembered. Switching pages animates (see [[04 - Frontend & UI]]).
- Ticks are **permanent** (static scope, no reset). Each page shows its own progress; the track shows overall progress + which block is "current."

**Pinned panels (always visible, any phase):**
- ***DSA Maintenance*** — the Phase-2 cross-block pattern lists (Heap/PQ · Tries · Intervals · Greedy · Backtracking) + the per-problem method.
- ***Projects A1 & A2*** — the Appendix-A deep-dive bars ("can I say this aloud?"); the build days themselves live inside Blocks 7–11 and 13.
- Rendered as a side panel (desktop) / collapsible drawer (mobile), persistent across phase navigation. Ticks are permanent.

**Daily hours:**
- A decimal number per day (default **0**), one stream for the whole Study track, normally entered at the 10 PM prompt (F7) but editable anytime. The track page shows today's hours, this week's Σ, and a simple history sparkline.

**Editability:** add / rename / reorder / remove phases, sections, and items; add new phases.

**Acceptance criteria:**
- Phase pages navigate next/prev; the stepper reflects per-page completion; active page persists across sessions.
- Pinned DSA/Projects panels stay visible and tickable regardless of the current page.
- Ticks never reset; hours default to 0 and roll up to "this week" on the tile.
- Editing phases/sections/items persists and doesn't corrupt completion state.

#### F4b — Gym (static list, weekly refresh + last-week score)
**Story:** A weekly checklist from my fitness plan that resets each week, so I can see how this week compares to last.

- **Gym** seeded from the **weekly workout split** in the fitness plan: Mon PUSH, Tue PULL, Wed LEGS+CORE, Thu OPTIONAL, Fri SHOULDERS+ARMS, Sat UPPER HYPERTROPHY, Sun rest/walk — as checkable items (optionally one section per day with the exercises beneath).
- Completion is tracked **per week**; a new week starts unchecked automatically. The page + tile show **this week's count** and **last week's score**.
- Items support a **weekly target count** (e.g. cardio 2×) so a single item can be ticked multiple times in a week.
- Each exercise carries an inline **progress field** holding what was done *last session* — **sets**, **reps**, and **weight** — so the user can chase progressive overload. `sets` and `reps` are whole numbers; `weight` is free text (so `"60kg"`, `"BW+10kg"`, `"red band"` all fit). These are **persistent item state**: they do **not** refresh with the weekly checkbox reset and change **only when the user edits them**. Stored on the item, separate from its `note`. (DB: `track_items.sets / .reps / .weight` — see [[03 - Database Schema]].)

**Acceptance criteria:**
- On a new week, items appear unchecked; last week's completed count is displayed and preserved.
- Multi-count items (target > 1) track partial progress within the week.
- Editing items/sections persists into future weeks without altering past weeks' history.
- Each exercise shows an editable sets/reps/weight progress field; edits persist and **survive the weekly refresh** (a new week shows the same last-session numbers, unchecked). Empty/un-set fields render as a neutral placeholder, not `0`.

#### F4c — Diet (daily refresh + meal slots + satisfaction)
**Story:** Each day I tick off my meals and rate how clean the day's eating was.

- **Diet** is a fixed daily list of **7 meal slots**, in order: **Breakfast · Small meal · Lunch · Pre-workout · Post-workout · Snack · Dinner**. Each is checkable per day; the list **refreshes every day** (a new day starts unchecked).
- Each meal slot carries an editable **note** describing the planned food (seeded from the fitness plan's sample timings — e.g. *Breakfast: Greek-yogurt bowl + whey ~40 g protein*).
- **Diet satisfaction (1–3)** is logged per day — captured at the 10 PM prompt (F7) alongside the day rating: **1** = had a lot of junk / skipped many meals; **2** = deviated from the ideal diet, but not much; **3** = complete ideal diet.
- Diet page shows today's meals + a small recent-days satisfaction strip; tile shows today's `meals done / 7` + today's satisfaction.

**Acceptance criteria:**
- On a new day, the 7 meal slots appear unchecked; previous days are preserved in history.
- Diet satisfaction (1–3) is captured per date and editable; reflected on the tile/diet page.
- Meal-slot notes are editable and persist.

#### F4d — Diet Weekly Protocol (weekly sub-panel)
**Story:** Below my daily meals, a small weekly checklist for the habits the fitness plan says make or break fat loss.

- A second **panel** on the Diet page (`weekly` scope) seeded from [[Fitness_Plan_v5_FatLoss_Physique]]: **Hit 150 g protein** (7×), **8–10k steps** (7×), **Daily supplements** — creatine/whey/B12/D3/omega-3 (7×), **10-min walk after lunch & dinner** (7×), **Sunday meal prep** (1×), **No match-night junk** (7×), **Sunday weigh-in + waist + photos** (1×).
- Refreshes weekly; multi-count items show e.g. `protein 5/7`. Last-week score shown for comparison.

**Acceptance criteria:**
- Protocol panel resets each week; multi-count items track partial progress; last week's count is shown.
- Editable independently of the daily meal slots.

### F5 — Daily Rating
**Story:** Give the day a 1–5 star rating.

- Set/change today's rating; editable for past days via the calendar.
- Feeds the heatmap + weekly average.

**Acceptance criteria:** one rating per date (overwrites); reflected immediately in calendar + average.

### F6 — Diary
**Story:** Free-text notes per day.

- Write/edit a note per date; reachable from the 10 PM prompt, dashboard, and any calendar day.

**Acceptance criteria:** notes persist per date; past days editable.

### F7 — 10 PM Evening Prompt (rating + diary + hours)
**Story:** At 10 PM IST I'm nudged to close out the day.

- Daily at **22:00 IST**, delivered as **Web Push** (primary) + **Email** (backup).
- Tapping it opens a single screen that collects: **today's rating (1–5)**, **diary note**, **Study hours** (default 0), and **diet satisfaction (1–3)**.
- **Smart suppression:** soften/skip if the day is already fully logged.

**Acceptance criteria:**
- Push arrives on iPhone (PWA-installed) and laptop around 10 PM IST; email arrives as backup.
- The deep-linked screen captures rating + diary + Study hours + diet satisfaction in one submit; hours default to 0.

### F8 — Authentication & PWA install
**Story:** My data is private and the app installs to my iPhone Home Screen.

- Supabase Auth, single account; all data gated behind login.
- Installable PWA (manifest + service worker) — required for iOS push — with an iOS "Add to Home Screen" hint and a post-install permission prompt.

**Acceptance criteria:** unauthenticated users can't read/write; app is installable and can register for push on iOS.

---

## 6. Feature → priority
| # | Feature | Priority |
|---|---|---|
| F1 | Dashboard (4 tiles) | Must |
| F4 | Track pages (static + weekly) | Must |
| F5/F6 | Rating + Diary | Must |
| F2 | Calendar heatmap | Must |
| F3 | General to-do list | Must |
| F8 | Auth + PWA | Must |
| F7 | 10 PM reminder + hours capture | Must (most complex — build last) |

## 7. Seed plan (from the source docs)
Created on first run; fully editable afterwards. See [[03 - Database Schema]] for structure.

- **Study** (phased) — phase pages *Block 1 → Block 15* + *Phase 4* + *Phase 5*, pinned *DSA Maintenance* and *Projects A1 & A2*. Source: [[Master_Roadmap]]; mapping rules: [[Seed - Study]]; SQL: `supabase/seed_study.sql`.
- **Gym** (weekly) — *This Week* panel: the Mon–Sun split (Push/Pull/Legs/Optional/Shoulders+Arms/Upper/Rest).
- **Diet** (daily + weekly) — *Daily Meals* (7 slots with planned-food notes) + *Weekly Protocol* (protein/steps/supplements/walks/meal-prep/no-junk/weigh-in).

## 8. Success metrics
- Rate + log hours ≥ 6 of 7 days/week.
- Dashboard loads < 1s on phone.
- $0/month.
- 10 PM reminder reliably reaches my phone.

## 9. Open questions / to confirm
- [x] **Seeding granularity: (b) fully detailed.** Seed down to individual topics/readings — **every `- [ ]` line** in the source plan becomes a `track_item`, and every bold sub-heading becomes a `track_section`. **Confirmed** (originally for SDE/FDE; carried over to the Study seed).
- [x] **SDE + FDE → Study (2026-07-06):** one track from [[Master_Roadmap]] — blocks as phase pages (17), pinned *DSA Maintenance* + *Projects A1 & A2*, duplicated appendix tasks live in the block that schedules them, **single Study-hours stream**. Appendix D (weekly review) deliberately not seeded. **Confirmed.**
- [x] Hours unit: **decimal hours** (e.g. 3.5). *Confirmed.*
- [x] Week start = **Monday** (matches the gym split). *Confirmed.*
- [x] Gym + Diet = **two separate tracks/tiles**. *Confirmed.*
- [x] **Diet → daily refresh** with 7 meal slots + 1–3 satisfaction. *Confirmed & specced (F4c).*
- [x] Should the Diet "150 g protein / steps / supplements / weigh-in" protocol items live as a **separate weekly checklist** too? **Yes — added as the weekly sub-panel F4d (Diet Weekly Protocol).** *Resolved.*
