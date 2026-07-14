# LifeOS — Frontend & UI

Related: [[00 - LifeOS Overview]] · [[01 - PRD]] · [[02 - System Architecture & Tech Stack]] · [[03 - Database Schema]]

> Goal: a **fresh, modern, interactive** personal app — not a static checklist. Mobile-first (iPhone PWA) and equally good on laptop. Fast, tactile, alive: smooth transitions, animated progress, satisfying check-offs.
>
> **Aesthetic inspiration:** [VR Education platform dashboard (Dribbble #20221682)](https://dribbble.com/shots/20221682-VR-Education-platform-dashboard) — *inspiration, not a template.* What we take from it: a deep dark canvas, a single **electric accent with a soft glow**, large **glassy rounded cards**, **gradient-filled charts**, oversized **tabular numerals**, and subtle depth (soft 3D-ish highlights). What we change: our own per-track color identities, our phase-page UX, and a **classy completion effect** instead of anything playful.
>
> **Locked design decisions:** Dark theme only (v1) · animation everywhere (aurora + motion on every screen) · **no confetti** — a refined "Aura" completion effect instead · **2-column tile grid** on phone.

---

## 1. Design principles
1. **Calm but alive.** Dark, focused canvas; motion and color reward action (a check should *feel* good) without being noisy.
2. **One glance, then one tap.** The dashboard answers "how am I doing?" instantly; everything is ≤1 tap from there.
3. **Progress is the hero.** Rings, bars, streaks, heatmap — the UI is mostly about visualizing momentum.
4. **Track identity.** Each track has its own accent color/gradient so Study/Gym/Diet feel distinct.
5. **Thumb-friendly.** Primary actions sit in the bottom third on mobile; nothing critical in the top corners.
6. **Respect the user.** Optimistic, instant interactions; honors `prefers-reduced-motion`; never blocks on the network.

## 2. Visual language (dark only, v1)
Inspired by the Dribbble VR dashboard's deep, premium dark look — refined for LifeOS.

- **Canvas:** very dark with a faint violet undertone, not flat black. Layered tones:
  - base `#0A0A0F` → panel `#121218` → raised `#1A1A22`, with 1px hairline borders `rgba(255,255,255,0.06)` and a top inner-highlight for the glass edge.
- **Background:** a slow **animated aurora** (large, blurred radial blobs in the house accent + a track tint) drifting behind frosted panels — present on **every screen** (calmer/dimmer on dense pages; see §3).
- **House accent (chrome, focus, primary buttons):** **electric iris** `#7C5CFF` with a soft outer **glow** (`box-shadow` bloom). A secondary "signal" accent — **acid lime** `#C6F432` — used sparingly for highlights, "today", and completion sparkle. This electric-accent-on-dark + glow is the core cue taken from the inspiration.
- **Track identities (gradients, kept but harmonized for dark):**
  - **Study** — indigo→violet `#6366F1 → #8B5CF6` (inherited from SDE when the tracks merged, 2026-07-06; icon `graduation-cap`)
  - **Gym** — amber→orange `#FBBF24 → #FB7185`
  - **Diet** — emerald→lime `#34D399 → #A3E635`
  - **To-Do** — fuchsia→rose `#E879F9 → #FB7185`
- **Rating palette (1–5 heatmap buckets):** `#EF4444 → #F59E0B → #EAB308 → #84CC16 → #22C55E`; un-rated = muted slate `#2A2A33`.
- **Charts:** smooth **gradient-filled** area/line charts (accent → transparent), thin strokes, glowing data points — the inspiration's data-viz feel. Progress shown as **rings** and slim bars.
- **Typography:** UI **Geist** (or Inter); **oversized bold tabular numerals** for the hero stats (hours, "3/7", weekly avg) — a signature of the reference; mono (Geist Mono) for resource chips/counts.
- **Radii & depth:** large radii (`rounded-3xl` cards, `rounded-2xl` controls); soft layered shadows + accent glow on active/hover; faint gradient sheen for a subtle 3D feel.
- **Iconography:** **lucide-react**, 1.5px stroke. (3D/gradient tile glyphs deferred — tiles use flat icons + gradient/glow for depth in v1.)

## 3. Motion & interaction (animated everywhere)
Motion is present on **every screen**, not just the dashboard — the aurora always drifts, panels settle in with spring, numbers count up. On dense pages (phase lists) the background is dimmer/slower so it stays readable.

- **Library:** **Framer Motion** for layout/page transitions; CSS for micro-interactions.
- **Page/phase transitions:** spring slide + fade; `AnimatePresence` between phase pages; shared-layout (`layoutId`) so a tapped tile **expands** into its page.
- **Check-off feedback:** spring scale-pop + a quick **stroke-draw** check, accent fill, and a soft haptic-style pulse.
- **★ The "Aura" completion effect (classy, replaces confetti):** when a section/phase/day completes, instead of confetti we play a **premium, restrained** sequence:
  1. a soft **radial bloom** of the track accent blooms out from behind the card, then fades;
  2. a single thin **light-sweep** glides diagonally across the card (a glossy specular highlight);
  3. the **progress ring fills** with a spring and the big number **counts up**;
  4. an elegant **glass toast** slides in ("Phase 0 complete · 100%") with a hairline accent underline and a couple of slow **lime sparkle** motes.
  No bursts, no scatter — light, glow, and motion. Tunable intensity; off under reduced-motion.
- **Progress rings & bars:** animate previous → new value; numbers via `tabular-nums`.
- **Gestures (mobile):** horizontal **swipe** between phase pages; swipe a to-do to complete/delete; pull-to-refresh; long-press to edit.
- **Hover (desktop):** tiles lift + gradient sheen + accent glow; subtle parallax on the aurora.
- **Micro-states:** skeleton shimmer on load, optimistic toggles, glass toasts, friendly empty states.
- **Reduced motion:** aurora freezes, transitions become opacity-only, the Aura effect reduces to a simple ring-fill + toast when `prefers-reduced-motion` is set.

## 4. Navigation & shell
- **Mobile:** bottom tab bar (frosted) — **Home · Tracks · Calendar · Diary · Add(+)**. The `+` opens a quick-add sheet (todo / rate today). Respects iOS safe-area insets.
- **Desktop:** left sidebar rail (icons + labels) with the same destinations; content max-width centered.
- **PWA:** custom install prompt + iOS "Add to Home Screen" coach screen (required for push). Standalone display, themed status bar, splash screen.

## 5. Key screens

### 5.1 Dashboard (Home) — 4 tiles + calendar
```
┌──────────────────────────────────────────────┐
│  Good evening, Yuvraj           ☾ 6 Jul      │
│  ┌───────── Rate today ─────────┐  (if unrated)│
│  │ ☆ ☆ ☆ ☆ ☆     →  tap to log │             │
│  └──────────────────────────────┘             │
│                                                │
│  ┌─────────┐ ┌─────────┐                       │
│  │ STUDY ◔ │ │ GYM  ◕  │        ← tiles        │
│  │ Block 1 │ │ 4/7 wk  │          w/ rings     │
│  │ 3.5h ▲  │ │ last 6  │                       │
│  └─────────┘ └─────────┘                       │
│  ┌─────────┐ ┌─────────┐                       │
│  │ DIET ◕  │ │ TO-DO   │                       │
│  │ 5/7 ·😊3│ │ 2 urgent│                       │
│  └─────────┘ └─────────┘                       │
│                                                │
│  ┌──── July ──────── wk avg 4.2 ★ ────┐         │
│  │ M T W T F S S   (rating heatmap)   │         │
│  │ ■ ■ ▦ ■ ■ □ □                       │         │
│  └────────────────────────────────────┘         │
└──────────────────────────────────────────────┘
```
- Each **tile** = glass card with the track gradient, an **animated progress ring**, the key stat, and a sparkline/comparison. Tap → track page (shared-layout expand).
- **Rate-today** banner only when today is unrated; tapping opens the capture sheet (F7).

### 5.2 Study track page (phased) — the centerpiece
```
┌──────────────────────────────────────────────┐
│ ‹ Study                            3.5h today │
│ ●━━●━━●━━○━━○ … ○━━○   ← phase stepper (17)    │
│ B1  B2  B3  B4  B5 … P4  P5  (B3 active, 40%) │
│                                                │
│ ┌── Block 3 — Graphs I · Networking ────────┐  │
│ │ DSA — Graphs I                   4/11 ▓░ │  │
│ │  ☑ Number of Islands                     │  │
│ │  ☑ Clone Graph                           │  │
│ │  ☐ Course Schedule (cycle detection)     │  │
│ │  …                                        │  │
│ │ Core CS — Networking             1/4 ░░  │  │
│ │ Exit check                       ☐        │  │
│ └──────────────────────────────────────────┘  │
│      ‹ Prev Block             Next Block ›      │
│                                                │
│ ┌─ Pinned ─────────────────────────────────┐  │  ← always visible
│ │ ▸ DSA Maintenance          2/5            │  │     (drawer on mobile,
│ │ ▸ Projects A1 & A2         1/9            │  │      sidebar on desktop)
│ └──────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```
- **Phase stepper:** segmented progress at top; each node shows % complete; tap a node or use Prev/Next (or swipe) to switch — animated slide between phase pages, active phase remembered.
- **Sections** (DSA / Core CS / OYR / Job / Exit check) are collapsible accordions with their own mini progress.
- **Items** show title + a tappable resource chip (opens the link). Check = pop + fill; finishing a section/phase triggers the **"Aura" completion effect** (§3), *not* confetti.
- **Pinned panels** (DSA Maintenance, Projects A1 & A2) persist across phases — collapsible bottom drawer on mobile, right sidebar on desktop.
- **Hours widget:** today's hours editable inline (stepper or quick-tap presets) + a 7-day bar history.

### 5.3 Gym track page (weekly panel)
```
┌──────────── GYM · This Week 4/7 ─ last 6 ─┐
│ ▸ Mon · PUSH                  (today)      │
│   ☑ Seated DB Shoulder Press 4×12          │
│        └ last:  3×8  · 60kg          ✎    │ ← inline progress, persists
│   ☑ Incline DB Press 4×10                  │
│        └ last:  4×10 · 22.5kg        ✎    │
│   ☐ Cardio  2×                  0/2        │ ← multi-count (weekly_target)
│ ▸ Tue · PULL                               │
│   …                                        │
└────────────────────────────────────────────┘
```
- A single **"This Week"** panel; sections = Mon…Sun (color-coded, today highlighted), exercises as checkable rows. The prescribed scheme (e.g. `4×12`) sits in the item title. Header shows `this week x/y` + **last week** chip. Week auto-rolls on Monday.
- **Per-exercise progress (sets / reps / weight):** a compact inline strip under each exercise showing what was done **last session** — tap the ✎ to edit. `sets`/`reps` are number steppers, `weight` is a free-text field (units/bodyweight/bands). **These persist across weeks** — the Monday refresh clears the checkbox but keeps the numbers (PRD F4b). Un-set fields show a muted "—" placeholder, never `0`. Optimistic save; no separate "save" tap.

### 5.4 Diet track page (daily meals + weekly protocol)
```
┌─────────── DIET ───────────┐
│ Today · Mon 16 Jun         │
│ ☑ Breakfast  · yogurt+whey │   ← 7 meal slots, tap note to expand
│ ☑ Small meal · fruit+chana │
│ ☐ Lunch      · dal+soya    │
│ ☐ Pre-workout· banana+coffee│
│ … (5/7)                     │
│                            │
│ Diet today:  😞  😐  😀     │   ← 1–3 satisfaction (also at 10pm)
│                            │
│ ┌ Weekly Protocol  (wk) ──┐ │
│ │ Protein 150g     5/7 ▓░ │ │
│ │ 8–10k steps      4/7    │ │
│ │ Supplements      6/7    │ │
│ │ Sunday meal prep  ☐     │ │
│ └─────────────────────────┘ │
└────────────────────────────┘
```

### 5.5 10 PM capture sheet (F7)
A focused bottom-sheet/modal, one screen: **star rating (1–5)** → **diet satisfaction (1–3 faces)** → **Study hours** (default 0, quick stepper) → **diary** (expandable). Big primary "Save day" button; everything optional; deep-linked from the push/email.

### 5.6 Calendar / Diary
- **Calendar:** month heatmap (rating buckets), weekly-average pill, tap a day → detail (rating, diet score, hours, diary) editable. Smooth month-swipe.
- **Diary:** clean writing surface (large type, autosave), date navigation, optional list view of past entries.

### 5.7 General To-Do
- Grouped by urgency with colored left-borders; swipe to complete/delete; quick-add bar pinned at the bottom; completed items collapse under a "Done" divider.

## 6. Component inventory (build order)
- **Primitives (shadcn/ui):** Button, Card, Sheet, Dialog, Tabs, Accordion, Progress, Switch, Toast, Tooltip, Input/Textarea, Select.
- **Custom:** `ProgressRing`, `PhaseStepper`, `TrackTile`, `ChecklistItem` (with resource chip + animated check), `ExerciseProgress` (inline sets/reps/weight editor on gym rows — number steppers + free-text weight, optimistic, persistent), `PinnedPanel`, `HeatmapCalendar`, `StarRating`, `FaceRating (1–3)`, `HoursStepper`, `GradientAreaChart`/`Sparkline`, `AuraCompletion` (the §3 effect), `AuroraBackground`, `GlassToast`, `BottomNav`, `QuickAddSheet`.

## 7. Tech choices (UI layer)
- **Tailwind CSS** + **shadcn/ui** (Radix primitives) · **Framer Motion** · **lucide-react** icons.
- **Charts:** lightweight — `visx` or `recharts` for sparklines/heatmap (or hand-rolled SVG for the heatmap to keep it crisp).
- **Data:** TanStack Query (optimistic mutations for toggles/hours) over the Supabase client.
- **Fonts:** Inter/Geist via `next/font` (self-hosted, no layout shift).
- **PWA:** manifest + service worker; themed splash/status bar; `next-pwa` or hand-rolled SW for push.

## 8. Accessibility & performance
- Honor `prefers-reduced-motion`; visible focus rings; AA contrast on text over glass (test the gradients); hit targets ≥44px.
- Optimistic UI + skeletons so it feels instant; lazy-load track pages; memoize heatmap; keep the aurora GPU-cheap (CSS gradient/transform, not heavy canvas).
- Target: dashboard interactive < 1s on phone (PRD success metric).

## 9. Resolved design decisions
- [x] **Dark theme only** for v1 (no light toggle yet).
- [x] **Animated everywhere** — aurora + motion on every screen (dimmer/slower on dense pages).
- [x] **No confetti** — the classy **"Aura" completion effect** (§3) instead.
- [x] **2-column tile grid** on phone.
- [x] Aesthetic direction anchored to the Dribbble VR-education dashboard (electric accent + glow, glassy cards, gradient charts, oversized numerals) — adapted, not copied.

## 10. Resolved (continued)
- [x] **House accent confirmed:** electric iris **`#7C5CFF`** (chrome, focus, primary) + acid-lime **`#C6F432`** signal (highlights, "today", Aura sparkle).
- [x] **3D/gradient tile glyphs deferred** — not in v1; tiles use flat lucide icons + gradient/glow only.
