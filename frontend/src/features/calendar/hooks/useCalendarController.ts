import type { RefObject } from 'react'
import { useRef, useState } from 'react'

import type { FCView } from '../components/CalendarToolbar'
import type { CalendarHandle } from '../components/CalendarView'

/**
 * Shared calendar wiring for both the dedicated Calendar page and the dashboard
 * Calendar panel: the imperative ref, the current title/view, and the
 * navigation handlers. Each surface keeps its own event-modal behaviour (the
 * page uses a local modal, the panel the shared interaction host).
 */
export interface CalendarController {
  calendarRef: RefObject<CalendarHandle | null>
  title: string
  setTitle: (title: string) => void
  view: FCView
  prev: () => void
  next: () => void
  today: () => void
  changeView: (view: FCView) => void
}

export function useCalendarController(initialView: FCView = 'dayGridMonth'): CalendarController {
  const calendarRef = useRef<CalendarHandle>(null)
  const [title, setTitle] = useState('')
  const [view, setView] = useState<FCView>(initialView)

  return {
    calendarRef,
    title,
    setTitle,
    view,
    prev: () => calendarRef.current?.prev(),
    next: () => calendarRef.current?.next(),
    today: () => calendarRef.current?.today(),
    changeView: (next) => {
      calendarRef.current?.changeView(next)
      setView(next)
    },
  }
}
