import apiClient from '@/services/apiClient'

import type {
  CalendarEvent,
  CreateCalendarEventPayload,
  UpdateCalendarEventPayload,
} from '../types'

const BASE = '/api/calendar'

export const calendarApi = {
  getEvents: (workspaceId: string): Promise<CalendarEvent[]> =>
    apiClient.get<CalendarEvent[]>(BASE, { params: { workspace_id: workspaceId } }).then((r) => r.data),

  createEvent: (payload: CreateCalendarEventPayload): Promise<CalendarEvent> =>
    apiClient.post<CalendarEvent>(BASE, payload).then((r) => r.data),

  updateEvent: (id: string, payload: UpdateCalendarEventPayload): Promise<CalendarEvent> =>
    apiClient.patch<CalendarEvent>(`${BASE}/${id}`, payload).then((r) => r.data),

  deleteEvent: (id: string): Promise<void> =>
    apiClient.delete(`${BASE}/${id}`).then(() => undefined),
}
