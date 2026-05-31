import { Calendar } from 'lucide-react'
import { useRef, useState } from 'react'

import { CalendarEventModal } from '@/features/calendar/components/CalendarEventModal'
import type { FCView } from '@/features/calendar/components/CalendarToolbar'
import { CalendarToolbar } from '@/features/calendar/components/CalendarToolbar'
import type { CalendarHandle } from '@/features/calendar/components/CalendarView'
import { CalendarView } from '@/features/calendar/components/CalendarView'
import { useCalendarStore } from '@/features/calendar/store'
import type { CalendarEvent } from '@/features/calendar/types'
import { useTaskStore } from '@/features/tasks/store'
import { useWorkspaceStore } from '@/features/workspace/store'

import { DashboardPanel } from './DashboardPanel'

/**
 * Dashboard panel wrapping the calendar for the active workspace.
 * Defaults to month view for compact panel context.
 * Reads from the calendar store — data fetching is handled by DashboardPage.
 */
export function CalendarPanel() {
  const calendarRef = useRef<CalendarHandle>(null)
  const [calendarTitle, setCalendarTitle] = useState('')
  const [currentView, setCurrentView] = useState<FCView>('dayGridMonth')
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [newEventStart, setNewEventStart] = useState<string | null>(null)
  const [newEventEnd, setNewEventEnd] = useState<string | null>(null)

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const events = useCalendarStore((s) => s.events)
  const tasks = useTaskStore((s) => s.tasks)

  if (!activeWorkspace) return null

  function handleViewChange(view: FCView) {
    calendarRef.current?.changeView(view)
    setCurrentView(view)
  }

  function handleDateSelect(startStr: string, endStr: string) {
    const toLocal = (s: string) => (s.length === 10 ? `${s}T09:00` : s.substring(0, 16))
    setNewEventStart(toLocal(startStr))
    setNewEventEnd(toLocal(endStr))
    setEditingEvent(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingEvent(null)
    setNewEventStart(null)
    setNewEventEnd(null)
  }

  return (
    <>
      <DashboardPanel
        title="Calendar"
        icon={<Calendar size={13} />}
      >
        <div className="flex flex-col gap-0 p-3">
          <CalendarToolbar
            title={calendarTitle}
            currentView={currentView}
            onPrev={() => calendarRef.current?.prev()}
            onNext={() => calendarRef.current?.next()}
            onToday={() => calendarRef.current?.today()}
            onViewChange={handleViewChange}
            onAddEvent={() => { setEditingEvent(null); setNewEventStart(null); setNewEventEnd(null); setShowModal(true) }}
          />
          <CalendarView
            ref={calendarRef}
            events={events}
            initialView="dayGridMonth"
            className="[&_.fc-button]:hidden [&_.fc-toolbar]:hidden"
            onEventClick={(ev) => { setEditingEvent(ev); setShowModal(true) }}
            onDateSelect={handleDateSelect}
            onDatesSet={setCalendarTitle}
          />
        </div>
      </DashboardPanel>

      {showModal && (
        <CalendarEventModal
          event={editingEvent}
          defaultStart={newEventStart}
          defaultEnd={newEventEnd}
          workspaceId={activeWorkspace.id}
          tasks={tasks}
          onClose={closeModal}
        />
      )}
    </>
  )
}
