import { Calendar } from 'lucide-react'

import { ROUTES } from '@/constants'
import { CalendarToolbar } from '@/features/calendar/components/CalendarToolbar'
import { CalendarView } from '@/features/calendar/components/CalendarView'
import { useCalendarController } from '@/features/calendar/hooks/useCalendarController'
import { useCalendarStore } from '@/features/calendar/store'
import { parseServerDate, toDatetimeLocal } from '@/features/calendar/types'
import { useWorkspaceStore } from '@/features/workspace/store'

import { useDashboardInteractions } from '../store/interactions'
import { DashboardPanel, PanelFooterLink, PanelFooterSummary } from './DashboardPanel'

/**
 * Dashboard panel wrapping the calendar for the active workspace.
 * Create / edit / delete all run inline through the shared interaction host —
 * the calendar store does the work, so no logic is duplicated.
 */
export function CalendarPanel() {
  const { calendarRef, title, view, prev, next, today, changeView, setTitle } =
    useCalendarController('dayGridMonth')

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const events = useCalendarStore((s) => s.events)
  const openEvent = useDashboardInteractions((s) => s.openEvent)

  if (!activeWorkspace) return null

  const todayKey = new Date().toDateString()
  const eventsToday = events.filter((e) => parseServerDate(e.start_time).toDateString() === todayKey).length

  function handleDateSelect(startStr: string, endStr: string) {
    openEvent({ event: null, defaultStart: toDatetimeLocal(startStr), defaultEnd: toDatetimeLocal(endStr) })
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
      <div className="flex flex-col">
        <CalendarToolbar
          title={title}
          currentView={view}
          onPrev={prev}
          onNext={next}
          onToday={today}
          onViewChange={changeView}
          onAddEvent={() => openEvent({ event: null })}
        />
        <CalendarView
          ref={calendarRef}
          events={events}
          initialView="dayGridMonth"
          className="[&_.fc-button]:hidden [&_.fc-toolbar]:hidden"
          onEventClick={(ev) => openEvent({ event: ev })}
          onDateSelect={handleDateSelect}
          onDatesSet={setTitle}
        />
      </div>
    </DashboardPanel>
  )
}
