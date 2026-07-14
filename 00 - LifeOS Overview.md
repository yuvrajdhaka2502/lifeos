# LifeOS — Project Overview (MOC)

> Personal life-operations dashboard. Single user. Web app, deployed on Vercel, data on Supabase. Accessed from laptop and iPhone browser (installable as a PWA).
> Location: `Obsidian Main/LifeOS/`
Claude Session book reset - claude --resume 7787cb87-26a4-4f2d-a290-bcd68aca109f

## Documents
- [[01 - PRD]] — Product requirements: vision, features, acceptance criteria
- [[02 - System Architecture & Tech Stack]] — How it's built, notification pipeline, free-tier analysis
- [[03 - Database Schema]] — Tables, relationships, static/weekly/daily model, RLS
- [[04 - Frontend & UI]] — Design language, phase-page UX, components, motion/interaction
- [[05 - Database Migration (DDL)]] — Executable Postgres/Supabase migration: extensions, enums, tables, indexes, triggers, RLS policies
- [[06 - Seed Script]] — One-time data seed: tracks → phases → sections → items, from the plan docs (Gym/Diet here; Study in `supabase/seed_study.sql`)
- [[07 - App Skeleton]] — Implementation scaffold: Next.js layout, Supabase clients, IST helpers, TanStack Query hooks, reminder function, build order
- [[08 - Setup & Deployment Runbook]] — Hands-on steps: create the Supabase project, run migration + seed, keys, deploy to Vercel, install on iPhone
- [[09 - Build Progress & Next Steps]] — Living build log / session handoff: what's done, what's next, gotchas + fixes
- [[Seed - Study]] — How [[Master_Roadmap]] maps onto the Study track (blocks → phase pages, pinned panels, dedup rules)
- [[Master_Roadmap]] — The self-contained switch plan the Study track is seeded from (Blocks 1–15 + Phases 4–5 + appendices)

## Source plans (the three tracks are seeded from these)
- **Study** → [[Master_Roadmap]] (in this repo) — the complete SDE+AI switch plan (replaced the separate SDE/FDE plans on 2026-07-06)
- **Gym + Diet** → [[Fitness_Plan_v5_FatLoss_Physique]] (`Obsidian Main/Gym/...`) — 8-week fat-loss & physique plan (5 lifting days, egg-free diet)

## One-paragraph summary
LifeOS is a single-user dashboard with **four tiles**: three tracks (Study, Gym, Diet) plus a General To-Do list. **Study** is split into **phase pages** I navigate through (Blocks 1–15, then Phase 4 and Phase 5 — 17 pages), with **always-pinned** DSA-Maintenance + Projects panels and **daily hours** logging. **Gym** is a weekly Mon–Sun panel with last-week score; **Diet** is a daily 7-meal checklist plus a weekly habit-protocol sub-panel. A daily self-rating (1–5 stars), diet-satisfaction (1–3), and diary feed a calendar heatmap. Every night at 10:00 PM IST a web-push + email nudge asks me to rate the day, journal, log Study hours, and rate the diet. The UI is designed to feel **modern, animated and interactive** — not a static checklist (see [[04 - Frontend & UI]]).

## Locked decisions
| Decision | Choice |
|---|---|
| Project name | LifeOS |
| Vault location | `Obsidian Main/LifeOS/` |
| Users | Single user (me) |
| Dashboard tiles | 4 — Study, Gym, Diet, General To-Do (was 5 with SDE+FDE until 2026-07-06) |
| Study | **Phase pages** (17: Blocks 1–15 + Phase 4 + Phase 5, navigable, persistent ticks) + **pinned panels** (*DSA Maintenance* + *Projects A1 & A2*) + **daily hours log** (single stream) |
| Gym | **Weekly panel** (Mon–Sun split) + last-week score + **per-exercise progress** (sets/reps/weight, persistent across weeks) |
| Diet | **Daily Meals** (7 slots) + **Weekly Protocol** sub-panel (protein/steps/supplements/walks/meal-prep/no-junk/weigh-in) |
| Editability | All track items + sections editable |
| Rating scale | 1–5 stars (day) · 1–3 (diet satisfaction) |
| Evening prompt collects | Day rating (1–5) + diary + Study hours + **diet satisfaction (1–3)** |
| Reminder time | 10:00 PM IST, daily |
| Reminder delivery | Web Push (primary) + Email (backup) |
| Primary device | iPhone (PWA install required for push) + laptop |
| Hosting | Vercel (Hobby) · DB/Backend Supabase (Free) |
| Timezone | Asia/Kolkata (IST, UTC+5:30), no DST |
| UI aesthetic | Dark-only · animated everywhere · glassy electric-accent look (Dribbble VR-dashboard inspired) · classy "Aura" completion (no confetti) · 2-col tile grid — see [[04 - Frontend & UI]] |

## Status
- [x] Feature discussion
- [x] PRD
- [x] Architecture & Tech Stack
- [x] Database Schema (phases model)
- [x] Frontend & UI design
- [x] Migration DDL (executable schema)
- [x] Seed script + **DB provisioned, migrated & seeded** (Supabase, 2026-06-26)
- [x] **App scaffolded & running** (Next 16 / React 19 / Tailwind v4; auth gate + seeded dashboard, 2026-06-26)
- [x] **SDE + FDE → Study swap** (2026-07-06) — one Study track seeded from [[Master_Roadmap]]; see [[Seed - Study]]
- [x] **F4 track pages built** (2026-07-06) — Study phased page (stepper + pinned panels + hours) and Gym/Diet panel pages
- [x] **F1 dashboard built** (2026-07-06) — 4 live tiles + Rate-today banner + mini rating heatmap
- [x] **F5/F6 + F2 built** (2026-07-06) — `/calendar` (heatmap + editable day-detail sheet) + `/diary` (autosave)
- [x] **F3 todos built** (2026-07-06) — `/todos` (urgency groups + quick-add + Done divider)
- [ ] Feature build — resume at [[09 - Build Progress & Next Steps]] (F7 capture + reminder)
