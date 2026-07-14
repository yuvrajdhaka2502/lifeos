import type { Database } from '@/lib/types'

type Scope = Database['public']['Enums']['period_scope']

// IST = UTC+5:30, no DST. Shift the instant by +5:30, then read with UTC getters
// → IST wall-clock without any tz library.
const IST_MIN = 330 // 5*60 + 30
const shift = (d: Date) => new Date(d.getTime() + IST_MIN * 60_000)

/** 'YYYY-MM-DD' for the IST calendar day of `d`. */
export const istDateKey = (d = new Date()) => shift(d).toISOString().slice(0, 10)

/** Monday (IST) of `d`'s week, 'YYYY-MM-DD'. */
export function istWeekKey(d = new Date()) {
  const x = shift(d)
  const mondayOffset = (x.getUTCDay() + 6) % 7 // Mon=0 … Sun=6
  x.setUTCDate(x.getUTCDate() - mondayOffset)
  return x.toISOString().slice(0, 10)
}

/** Previous Monday — for the Gym/Protocol "last week" score. */
export function istLastWeekKey(d = new Date()) {
  const x = shift(d)
  x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7) - 7)
  return x.toISOString().slice(0, 10)
}

/** Short IST weekday name ('Mon' … 'Sun') — e.g. to highlight today's gym day. */
export function istWeekdayShort(d = new Date()) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][shift(d).getUTCDay()]
}

/** IST wall-clock hour 0–23 — for the dashboard greeting. */
export function istHour(d = new Date()) {
  return shift(d).getUTCHours()
}

/** 'Sun 6 Jul' — IST display date for the dashboard header. */
export function istDisplayDate(d = new Date()) {
  const x = shift(d)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${istWeekdayShort(d)} ${x.getUTCDate()} ${months[x.getUTCMonth()]}`
}

/** 'YYYY-MM' for the IST calendar month of `d` — the calendar's month key. */
export const istMonthKey = (d = new Date()) => istDateKey(d).slice(0, 7)

/** The last `n` IST date keys ending today (oldest first) — e.g. the diet strip. */
export function istLastNDates(n: number, d = new Date()) {
  const x = shift(d)
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const y = new Date(x)
    y.setUTCDate(y.getUTCDate() - i)
    out.push(y.toISOString().slice(0, 10))
  }
  return out
}

/** The period_key for an item, from its phase's scope (DB §4 / arch §3). */
export function periodKey(scope: Scope, d = new Date()) {
  return scope === 'static' ? 'static' : scope === 'weekly' ? istWeekKey(d) : istDateKey(d)
}
