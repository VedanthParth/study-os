import { create } from 'zustand'

import { calendarApi } from '../api'
import type {
  CalendarEvent,
  CreateCalendarEventPayload,
  UpdateCalendarEventPayload,
} from '../types'

interface CalendarState {
  events: CalendarEvent[]
  loading: boolean
}

interface CalendarActions {
  fetchEvents: (workspaceId: string) => Promise<void>
  createEvent: (payload: CreateCalendarEventPayload) => Promise<CalendarEvent>
  updateEvent: (id: string, payload: UpdateCalendarEventPayload) => Promise<CalendarEvent>
  deleteEvent: (id: string) => Promise<void>
  clearEvents: () => void
}

export const useCalendarStore = create<CalendarState & CalendarActions>((set) => ({
  events: [],
  loading: false,

  fetchEvents: async (workspaceId) => {
    set({ loading: true })
    try {
      const events = await calendarApi.getEvents(workspaceId)
      set({ events, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  createEvent: async (payload) => {
    const event = await calendarApi.createEvent(payload)
    set((state) => ({ events: [...state.events, event] }))
    return event
  },

  updateEvent: async (id, payload) => {
    const updated = await calendarApi.updateEvent(id, payload)
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? updated : e)),
    }))
    return updated
  },

  deleteEvent: async (id) => {
    await calendarApi.deleteEvent(id)
    set((state) => ({ events: state.events.filter((e) => e.id !== id) }))
  },

  clearEvents: () => set({ events: [] }),
}))
