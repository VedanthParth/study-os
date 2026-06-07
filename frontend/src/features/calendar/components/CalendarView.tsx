import type { DatesSetArg, EventClickArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { forwardRef, useImperativeHandle, useRef } from 'react'

import type { CalendarEvent } from '../types'
import { EVENT_TYPE_COLORS, parseServerDate } from '../types'
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
  initialView?: FCView
  className?: string
  /** Fill the parent's height (cells shrink to fit) instead of growing to content. */
  fill?: boolean
}

export const CalendarView = forwardRef<CalendarHandle, CalendarViewProps>(
  ({ events, onEventClick, onDateSelect, onDatesSet, initialView, className, fill }, ref) => {
    const calendarRef = useRef<FullCalendar>(null)

    useImperativeHandle(ref, () => ({
      prev: () => calendarRef.current?.getApi().prev(),
      next: () => calendarRef.current?.getApi().next(),
      today: () => calendarRef.current?.getApi().today(),
      changeView: (view) => calendarRef.current?.getApi().changeView(view),
    }))

    // Pass Date objects (absolute instants) rather than raw naive strings so
    // FullCalendar doesn't re-interpret stored UTC times as local. See parseServerDate.
    // Soft pills: a light tint of the type colour as the fill, the solid colour
    // as the text — calmer than saturated bars and readable in both themes.
    const fcEvents = events.map((e) => {
      const color = EVENT_TYPE_COLORS[e.event_type]
      return {
        id: e.id,
        title: e.title,
        start: parseServerDate(e.start_time),
        end: parseServerDate(e.end_time),
        backgroundColor: `${color}22`,
        borderColor: 'transparent',
        textColor: color,
      }
    })

    function handleEventClick(arg: EventClickArg) {
      const found = events.find((e) => e.id === arg.event.id)
      if (found) onEventClick(found)
    }

    function handleDatesSet(arg: DatesSetArg) {
      onDatesSet(arg.view.title)
    }

    return (
      <div className={className ?? 'rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-sm)] [&_.fc-button]:hidden [&_.fc-toolbar]:hidden'}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={initialView ?? 'timeGridWeek'}
          headerToolbar={false}
          selectable
          selectMirror
          select={(arg) => onDateSelect(arg.startStr, arg.endStr)}
          events={fcEvents}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          height={fill ? '100%' : 'auto'}
          eventDisplay="block"
          dayMaxEvents={3}
          dayMaxEventRows={3}
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
