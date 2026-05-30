import type { DatesSetArg, EventClickArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { forwardRef, useImperativeHandle, useRef } from 'react'

import type { CalendarEvent } from '../types'
import { EVENT_TYPE_COLORS } from '../types'
import type { FCView } from './CalendarToolbar'

export interface CalendarHandle {
  prev: () => void
  next: () => void
  today: () => void
  changeView: (view: FCView) => void
}

interface CalendarViewProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onDateSelect: (startStr: string, endStr: string) => void
  onDatesSet: (title: string) => void
}

export const CalendarView = forwardRef<CalendarHandle, CalendarViewProps>(
  ({ events, onEventClick, onDateSelect, onDatesSet }, ref) => {
    const calendarRef = useRef<FullCalendar>(null)

    useImperativeHandle(ref, () => ({
      prev: () => calendarRef.current?.getApi().prev(),
      next: () => calendarRef.current?.getApi().next(),
      today: () => calendarRef.current?.getApi().today(),
      changeView: (view) => calendarRef.current?.getApi().changeView(view),
    }))

    const fcEvents = events.map((e) => ({
      id: e.id,
      title: e.title,
      start: e.start_time,
      end: e.end_time,
      backgroundColor: EVENT_TYPE_COLORS[e.event_type],
      borderColor: EVENT_TYPE_COLORS[e.event_type],
    }))

    function handleEventClick(arg: EventClickArg) {
      const found = events.find((e) => e.id === arg.event.id)
      if (found) onEventClick(found)
    }

    function handleDatesSet(arg: DatesSetArg) {
      onDatesSet(arg.view.title)
    }

    return (
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-sm)] [&_.fc-button]:hidden [&_.fc-toolbar]:hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          selectable
          selectMirror
          select={(arg) => onDateSelect(arg.startStr, arg.endStr)}
          events={fcEvents}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          height="auto"
          allDaySlot={false}
          slotMinTime="06:00:00"
          nowIndicator
          eventTimeFormat={{ hour: 'numeric', minute: '2-digit', omitZeroMinute: true, meridiem: 'short' }}
        />
      </div>
    )
  },
)

CalendarView.displayName = 'CalendarView'
