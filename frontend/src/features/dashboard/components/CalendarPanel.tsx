import { Calendar } from 'lucide-react'
import { useRef, useState } from 'react'

import { ROUTES } from '@/constants'
import type { FCView } from '@/features/calendar/components/CalendarToolbar'
import { CalendarToolbar } from '@/features/calendar/components/CalendarToolbar'
import type { CalendarHandle } from '@/features/calendar/components/CalendarView'
import { CalendarView } from '@/features/calendar/components/CalendarView'
import { useCalendarStore } from '@/features/calendar/store'
import { parseServerDate } from '@/features/calendar/types'
import { useWorkspaceStore } from '@/features/workspace/store'

import { useDashboardInteractions } from '../store/interactions'
import { DashboardPanel, PanelFooterLink, PanelFooterSummary } from './DashboardPanel'

/**
 * Dashboard panel wrapping the calendar for the active workspace.
 * Create / edit / delete all run inline through the shared interaction host —
 * the calendar store does the work, so no logic is duplicated.
 */
export function CalendarPanel() {
  const calendarRef = useRef<CalendarHandle>(null)
  const [calendarTitle, setCalendarTitle] = useState('')
  const [currentView, setCurrentView] = useState<FCView>('dayGridMonth')

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const events = useCalendarStore((s) => s.events)
  const openEvent = useDashboardInteractions((s) => s.openEvent)

  if (!activeWorkspace) return null

  const todayKey = new Date().toDateString()
  const eventsToday = events.filter((e) => parseServerDate(e.start_time).toDateString() === todayKey).length

  function handleViewChange(view: FCView) {
    calendarRef.current?.changeView(view)
    setCurrentView(view)
  }

  function handleDateSelect(startStr: string, endStr: string) {
    const toLocal = (s: string) => (s.length === 10 ? `${s}T09:00` : s.substring(0, 16))
    openEvent({ event: null, defaultStart: toLocal(startStr), defaultEnd: toLocal(endStr) })
  }

  return (
    <DashboardPanel
      title="Calendar"
      icon={<Calendar size={20} strokeWidth={1.75} />}
      footer={
        <>
          <PanelFooterSummary>
            {eventsToday === 0 ? 'No events today' : `${eventsToday} event${eventsToday === 1 ? '' : 's'} today`}
          </PanelFooterSummary>
          <PanelFooterLink to={ROUTES.CALENDAR}>View Calendar</PanelFooterLink>
        </>
      }
    >
      <div className="flex flex-col gap-0 p-[var(--panel-pad)]">
        <CalendarToolbar
          title={calendarTitle}
          currentView={currentView}
          onPrev={() => calendarRef.current?.prev()}
          onNext={() => calendarRef.current?.next()}
          onToday={() => calendarRef.current?.today()}
          onViewChange={handleViewChange}
          onAddEvent={() => openEvent({ event: null })}
        />
        <CalendarView
          ref={calendarRef}
          events={events}
          initialView="dayGridMonth"
          className="[&_.fc-button]:hidden [&_.fc-toolbar]:hidden"
          onEventClick={(ev) => openEvent({ event: ev })}
          onDateSelect={handleDateSelect}
          onDatesSet={setCalendarTitle}
        />
      </div>
    </DashboardPanel>
  )
}
