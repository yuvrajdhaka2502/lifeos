import { CalendarView } from '@/components/calendar/CalendarView'

/** F2 — month heatmap + editable day-detail sheet. ?d=YYYY-MM-DD deep-links a
 *  day (used by the dashboard mini calendar and, later, the 10 PM prompt). */
export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>
}) {
  const { d } = await searchParams
  const initialSelected = d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null
  return <CalendarView initialSelected={initialSelected} />
}
