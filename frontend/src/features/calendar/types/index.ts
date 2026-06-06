export type CalendarEventType = 'study' | 'exam' | 'deadline' | 'event'

export interface CalendarEvent {
  id: string
  workspace_id: string
  task_id: string | null
  title: string
  description: string | null
  event_type: CalendarEventType
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
}

export interface CreateCalendarEventPayload {
  workspace_id: string
  task_id?: string | null
  title: string
  description?: string
  event_type: CalendarEventType
  start_time: string
  end_time: string
}

export interface UpdateCalendarEventPayload {
  task_id?: string | null
  title?: string
  description?: string | null
  event_type?: CalendarEventType
  start_time?: string
  end_time?: string
}

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  study: 'Study',
  exam: 'Exam',
  deadline: 'Deadline',
  event: 'Event',
}

/** Hex values matching tokens.css semantic colors (CSS vars not supported in FullCalendar). */
export const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
  study: '#4f7cac',
  exam: '#c0525a',
  deadline: '#b07840',
  event: '#737373',
}

/**
 * Parse a datetime string returned by the API into a Date at the correct instant.
 *
 * The backend persists datetimes in SQLite, which drops timezone info, so values
 * come back as *naive* UTC strings (e.g. "2026-06-06T03:30:00" — no trailing "Z").
 * `new Date()` parses those as the viewer's LOCAL time, shifting every event by the
 * local UTC offset (the "times change when reopening" bug). We treat a missing
 * timezone designator as UTC so the user sees exactly what they saved.
 *
 * Strings that already carry a timezone (Z or ±HH:MM) are left untouched.
 */
export function parseServerDate(value: string): Date {
  const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value.trim())
  return new Date(hasTimezone ? value : `${value}Z`)
}
