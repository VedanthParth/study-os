import { useMemo } from 'react'

import { CalendarEventModal } from '@/features/calendar/components/CalendarEventModal'
import { SessionConfigModal } from '@/features/study/components/SessionConfigModal'
import { useStudyStore } from '@/features/study/store'
import type { StudyMethod } from '@/features/study/types'
import { TaskEditor } from '@/features/tasks/components/TaskEditor'
import { useTaskStore } from '@/features/tasks/store'
import { useWorkspaceStore } from '@/features/workspace/store'

import { useDashboardInteractions } from '../store/interactions'

/**
 * Single host for the dashboard's shared modals. Any widget can open a task,
 * a calendar event, or a study-session config via the interaction store; this
 * component resolves the intent against the existing stores and renders the
 * corresponding modal. Keeps cross-linking logic in one place with no duplicate
 * business logic — the modals themselves still talk to their own stores.
 */
export function DashboardInteractions() {
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const tasks = useTaskStore((s) => s.tasks)
  const sessionHistory = useStudyStore((s) => s.sessionHistory)

  const taskEditorId = useDashboardInteractions((s) => s.taskEditorId)
  const eventIntent = useDashboardInteractions((s) => s.eventIntent)
  const studyIntent = useDashboardInteractions((s) => s.studyIntent)
  const closeTaskEditor = useDashboardInteractions((s) => s.closeTaskEditor)
  const closeEvent = useDashboardInteractions((s) => s.closeEvent)
  const closeStudy = useDashboardInteractions((s) => s.closeStudy)
  const openTaskEditor = useDashboardInteractions((s) => s.openTaskEditor)

  // Default method for task-initiated sessions: reuse the most recent session's
  // method so "start studying" feels continuous with the user's habits.
  const lastMethod: StudyMethod | undefined = useMemo(() => {
    if (sessionHistory.length === 0) return undefined
    const recent = [...sessionHistory].sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    )[0]
    return recent?.method
  }, [sessionHistory])

  const editingTask = taskEditorId ? tasks.find((t) => t.id === taskEditorId) ?? null : null
  const workspaceId = activeWorkspace?.id ?? null

  return (
    <>
      {editingTask && <TaskEditor task={editingTask} onClose={closeTaskEditor} />}

      {eventIntent && workspaceId && (
        <CalendarEventModal
          event={eventIntent.event}
          defaultStart={eventIntent.defaultStart}
          defaultEnd={eventIntent.defaultEnd}
          workspaceId={workspaceId}
          tasks={tasks}
          onOpenTask={(taskId) => {
            closeEvent()
            openTaskEditor(taskId)
          }}
          onClose={closeEvent}
        />
      )}

      {studyIntent && workspaceId && (
        <SessionConfigModal
          method={studyIntent.method ?? lastMethod ?? 'pomodoro'}
          workspaceId={workspaceId}
          tasks={tasks}
          defaultTaskId={studyIntent.taskId}
          onClose={closeStudy}
        />
      )}
    </>
  )
}
