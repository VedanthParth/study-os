import { create } from 'zustand'

type CalendarState = Record<string, never>

export const useCalendarStore = create<CalendarState>()(() => ({}))
