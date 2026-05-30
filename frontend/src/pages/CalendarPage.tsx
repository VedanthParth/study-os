import { Calendar } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageContainer } from '@/components/ui/PageContainer'
import { TopBar } from '@/components/ui/TopBar'
import { CalendarEventModal } from '@/features/calendar/components/CalendarEventModal'
import type { FCView } from '@/features/calendar/components/CalendarToolbar'
import { CalendarToolbar } from '@/features/calendar/components/CalendarToolbar'
import type { CalendarHandle } from '@/features/calendar/components/CalendarView'
import { CalendarView } from '@/features/calendar/components/CalendarView'
import { useCalendarStore } from '@/features/calendar/store'
import type { CalendarEvent } from '@/features/calendar/types'
import { useTaskStore } from '@/features/tasks/store'
import { useWorkspaceStore } from '@/features/workspace/store'

export function CalendarPage() {
  const calendarRef = useRef<CalendarHandle>(null)
  const [calendarTitle, setCalendarTitle] = useState('')
  const [currentView, setCurrentView] = useState<FCView>('timeGridWeek')
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [newEventStart, setNewEventStart] = useState<string | null>(null)
  const [newEventEnd, setNewEventEnd] = useState<string | null>(null)

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces)

  const events = useCalendarStore((s) => s.events)
  const eventsLoading = useCalendarStore((s) => s.loading)
  const fetchEvents = useCalendarStore((s) => s.fetchEvents)
  const clearEvents = useCalendarStore((s) => s.clearEvents)

  const tasks = useTaskStore((s) => s.tasks)
  const fetchTasks = useTaskStore((s) => s.fetchTasks)

  const activeWorkspaceId = activeWorkspace?.id ?? null

  useEffect(() => {
    void fetchWorkspaces()
  }, [fetchWorkspaces])

  useEffect(() => {
    if (activeWorkspaceId) {
      void fetchEvents(activeWorkspaceId)
      void fetchTasks(activeWorkspaceId)
    } else {
      clearEvents()
    }
  }, [activeWorkspaceId, fetchEvents, fetchTasks, clearEvents])

  function handlePrev() { calendarRef.current?.prev() }
  function handleNext() { calendarRef.current?.next() }
  function handleToday() { calendarRef.current?.today() }

  function handleViewChange(view: FCView) {
    calendarRef.current?.changeView(view)
    setCurrentView(view)
  }

  function handleAddEvent() {
    setEditingEvent(null)
    setNewEventStart(null)
    setNewEventEnd(null)
    setShowModal(true)
  }

  function handleEventClick(event: CalendarEvent) {
    setEditingEvent(event)
    setNewEventStart(null)
    setNewEventEnd(null)
    setShowModal(true)
  }

  function handleDateSelect(startStr: string, endStr: string) {
    // Truncate to datetime-local format (YYYY-MM-DDTHH:MM)
    const toLocal = (s: string) =>
      s.length === 10 ? `${s}T09:00` : s.substring(0, 16)
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
      <TopBar title="Calendar" />

      <PageContainer>
        {!activeWorkspaceId ? (
          <EmptyState
            icon={<Calendar size={32} />}
            title="No workspace selected"
            description="Select or create a workspace to manage your calendar."
          />
        ) : eventsLoading ? (
          <LoadingState label="Loading calendar…" />
        ) : (
          <>
            <CalendarToolbar
              title={calendarTitle}
              currentView={currentView}
              onPrev={handlePrev}
              onNext={handleNext}
              onToday={handleToday}
              onViewChange={handleViewChange}
              onAddEvent={handleAddEvent}
            />
            <CalendarView
              ref={calendarRef}
              events={events}
              onEventClick={handleEventClick}
              onDateSelect={handleDateSelect}
              onDatesSet={setCalendarTitle}
            />
          </>
        )}
      </PageContainer>

      {showModal && activeWorkspaceId && (
        <CalendarEventModal
          event={editingEvent}
          defaultStart={newEventStart}
          defaultEnd={newEventEnd}
          workspaceId={activeWorkspaceId}
          tasks={tasks}
          onClose={closeModal}
        />
      )}
    </>
  )
}
