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
