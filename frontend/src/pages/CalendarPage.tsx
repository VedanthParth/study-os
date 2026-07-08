import { Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageContainer } from '@/components/ui/PageContainer'
import { TopBar } from '@/components/ui/TopBar'
import { CalendarEventModal } from '@/features/calendar/components/CalendarEventModal'
import { CalendarToolbar } from '@/features/calendar/components/CalendarToolbar'
import { CalendarView } from '@/features/calendar/components/CalendarView'
import { useCalendarController } from '@/features/calendar/hooks/useCalendarController'
import { useCalendarStore } from '@/features/calendar/store'
import type { CalendarEvent } from '@/features/calendar/types'
import { toDatetimeLocal } from '@/features/calendar/types'
import { useTaskStore } from '@/features/tasks/store'
import { useWorkspaceStore } from '@/features/workspace/store'

export function CalendarPage() {
  const { calendarRef, title, view, prev, next, today, changeView, setTitle } =
    useCalendarController('timeGridWeek')
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
    setNewEventStart(toDatetimeLocal(startStr))
    setNewEventEnd(toDatetimeLocal(endStr))
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
              title={title}
              currentView={view}
              onPrev={prev}
              onNext={next}
              onToday={today}
              onViewChange={changeView}
              onAddEvent={handleAddEvent}
            />
            <CalendarView
              ref={calendarRef}
              events={events}
              onEventClick={handleEventClick}
              onDateSelect={handleDateSelect}
              onDatesSet={setTitle}
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
