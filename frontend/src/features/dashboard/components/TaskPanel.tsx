import { CheckSquare } from 'lucide-react'
import { useMemo, useRef } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { useCalendarStore } from '@/features/calendar/store'
import type { CalendarEvent } from '@/features/calendar/types'
import { TaskInput } from '@/features/tasks/components/TaskInput'
import { TaskList } from '@/features/tasks/components/TaskList'
import { useTaskStore } from '@/features/tasks/store'
import type { Task } from '@/features/tasks/types'
import { useWorkspaceStore } from '@/features/workspace/store'

import { useDashboardInteractions } from '../store/interactions'
import { DashboardPanel, PanelFooterSummary } from './DashboardPanel'

/**
 * Dashboard panel wrapping task management for the active workspace.
 * Quick actions (complete, edit, delete, start study, open linked event) run
 * inline via the shared interaction store — no dedicated pages required.
 */
export function TaskPanel() {
  const inputRef = useRef<HTMLInputElement>(null)

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const tasks = useTaskStore((s) => s.tasks)
  const loading = useTaskStore((s) => s.loading)
  const events = useCalendarStore((s) => s.events)

  const openTaskEditor = useDashboardInteractions((s) => s.openTaskEditor)
  const openStudy = useDashboardInteractions((s) => s.openStudy)
  const openEvent = useDashboardInteractions((s) => s.openEvent)

  // Map task → its linked calendar event (event.task_id is the relationship).
  const eventByTaskId = useMemo(() => {
    const map = new Map<string, CalendarEvent>()
    for (const ev of events) {
      if (ev.task_id) map.set(ev.task_id, ev)
    }
    return map
  }, [events])

  if (!activeWorkspace) return null

  const openCount = tasks.filter((t) => !t.completed).length
  const doneCount = tasks.length - openCount

  function handleOpenEvent(task: Task) {
    const ev = eventByTaskId.get(task.id)
    if (ev) openEvent({ event: ev })
  }

  return (
    <DashboardPanel
      title="Tasks"
      icon={<CheckSquare size={20} strokeWidth={1.75} />}
      footer={
        <PanelFooterSummary>
          {tasks.length === 0 ? 'No tasks yet' : `${openCount} open · ${doneCount} done`}
        </PanelFooterSummary>
      }
    >
      <div className="flex flex-col gap-4 p-[var(--panel-pad)]">
        <TaskInput ref={inputRef} workspaceId={activeWorkspace.id} />

        {loading ? (
          <LoadingState label="Loading tasks…" />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            description="Capture what you need to study, then start a session right from a task."
            className="py-10"
            action={
              <button onClick={() => inputRef.current?.focus()} className="btn-primary btn-sm">
                Create first task
              </button>
            }
          />
        ) : (
          <TaskList
            tasks={tasks}
            onEdit={(t) => openTaskEditor(t.id)}
            onStartStudy={(t) => openStudy({ taskId: t.id })}
            onOpenEvent={handleOpenEvent}
            linkedEventTaskIds={new Set(eventByTaskId.keys())}
          />
        )}
      </div>
    </DashboardPanel>
  )
}
