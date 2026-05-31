export type UpcomingItemType = 'task' | 'deadline' | 'exam' | 'event'

export interface UpcomingItem {
  id: string
  title: string
  date: string  // ISO date YYYY-MM-DD
  item_type: UpcomingItemType
}

export interface AnalyticsOverview {
  tasks_completed_today: number
  tasks_completed_week: number
  study_minutes_today: number
  study_minutes_week: number
  completed_sessions: number
  streak_days: number
  upcoming_deadlines: UpcomingItem[]
  upcoming_events: UpcomingItem[]
}

/** Format minutes as "Xm" or "Xh Ym". */
export function formatStudyTime(minutes: number): string {
  if (minutes === 0) return '0m'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/** Format ISO date (YYYY-MM-DD) to "May 31" style. */
export function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
