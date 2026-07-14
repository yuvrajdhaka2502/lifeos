# Seed — Study Track (mapping from the Master Roadmap)

> Seed content for the **Study** track (replaced the SDE + FDE tracks on **2026-07-06**). Source: [[Master_Roadmap]] — the single self-contained switch plan (Blocks 1–15 + Phases 4–5 + appendices). Unlike the retired `Seed - SDE Month 1` / `Seed - FDE Month 1` docs, the source lives **in this repo**, so this doc records only the **mapping rules**, not a copy of the content. Executable SQL: `supabase/seed_study.sql` (applied to the live DB 2026-07-06).
> Related: [[00 - LifeOS Overview]] · [[01 - PRD]] · [[03 - Database Schema]] · [[06 - Seed Script]]

## Track row
| Field | Value |
|---|---|
| `slug` / `name` | `study` / Study |
| `layout` | `phased` (stepper + navigable phase pages + pinned panels) |
| `tracks_hours` | `true` — one daily **Study hours** stream (replaces the separate SDE + FDE hours) |
| `source_doc` | `Master_Roadmap.md` |
| `icon` / `color` / `accent` | `graduation-cap` / `#6366F1` → `#8B5CF6` (inherited SDE's indigo→violet) |
| `sort_order` | 1 (Gym = 2, Diet = 3 — dashboard is now **4 tiles**: Study, Gym, Diet, To-Do) |

## Mapping rules (locked 2026-07-06)
1. **Each roadmap Block = one navigable phase page** (`layout='phase'`, `period_scope='static'`): Blocks 1–15, then **Phase 4 — Interview Loops** and **Phase 5 — Negotiate & Close** as the final two pages → **17 pages** on the stepper. The roadmap's career-phase (1–3) membership is carried in each page's `subtitle`.
2. **Bold groups inside a block become `track_sections`** — *DSA — …*, *Core CS — …*, *OYR — …*, *Job — …*, *Backend study*, *Build*, *System design*. Blocks 12–15 and Phases 4–5 are flat checklists in the roadmap, so their items are seeded **sectionless**.
3. **Every `- [ ]` line becomes one `track_item`** (fully-detailed granularity, PRD §9). Inline URLs stay in the `title` (first URL → the UI's resource chip); shared base URLs live in the section title.
4. **Each block's ✅ exit check seeds as the final item** in an *Exit check* section (Phase-1/2/3 exits land in Blocks 6, 11, 15 respectively).
5. **Duplicated appendix tasks are materialized once, in the block that schedules them** — Project A1 Days 1–4 in Blocks 7/8/9/11, Project A2 Days 1–2 + the AI-interview essentials in Block 13, AI-theory evenings 1/2/3a/3b in Blocks 5–6 — each enriched with the appendix detail so the item is self-contained.
6. **Pinned panels** (`layout='pinned'`, static, always visible beside any phase page):
   - **DSA Maintenance** — Phase 2's cross-block pattern lists (Heap/PQ · Tries · Intervals · Greedy · Backtracking), one item per pattern line; the per-problem method lives in the panel subtitle.
   - **Projects A1 & A2** — Appendix A's **deep-dive bars only** (one item per "be able to say" line, sections A1/A2). The build days live in the blocks (rule 5); this panel is the "can I defend it aloud?" checklist.
7. **Not seeded:** Appendix C (resource index — no checkboxes) and **Appendix D (recurring weekly review)** — no weekly panel was chosen for Study; revisit if a weekly-reset review panel is ever wanted.

## Seeded shape (verified live)
**19 phases · 47 sections · 187 items** — Block 1: 28 · Block 2: 27 · Block 3: 17 · Block 4: 16 · Block 5: 19 · Block 6: 20 · Block 7: 7 · Block 8: 6 · Block 9: 5 · Block 10: 4 · Block 11: 4 · Block 12: 3 · Block 13: 5 · Block 14: 2 · Block 15: 3 · Phase 4: 3 · Phase 5: 4 · DSA Maintenance: 5 · Projects A1 & A2: 9.

## Hours
`track_hours` rows key on `(track_id, log_date)` — one decimal-hours value per day for Study. The 10 PM capture (F7) now collects **one** hours field instead of two.
