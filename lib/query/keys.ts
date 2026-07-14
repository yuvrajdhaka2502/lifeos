export const qk = {
  tracks: ['tracks'] as const,
  track: (slug: string) => ['track', slug] as const,
  phase: (phaseId: string, period: string) => ['phase', phaseId, period] as const,
  completions: (trackId: string, period: string) => ['completions', trackId, period] as const,
  trackScore: (trackId: string, period: string) => ['score', trackId, period] as const,
  hours: (trackId: string) => ['hours', trackId] as const,
  dailyLog: (dateKey: string) => ['daily_log', dateKey] as const,
  calendar: (monthKey: string) => ['calendar', monthKey] as const,
  todos: ['todos'] as const,
}
