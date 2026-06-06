import { SquareArrowOutUpRight, X } from 'lucide-react'
import { useState } from 'react'

import type { Task } from '@/features/tasks/types'

import { useCalendarStore } from '../store'
import type { CalendarEvent, CalendarEventType } from '../types'
import { EVENT_TYPE_LABELS } from '../types'

const EVENT_TYPES: CalendarEventType[] = ['study', 'exam', 'deadline', 'event']

/** Convert UTC ISO string → datetime-local value (YYYY-MM-DDTHH:MM) in local time. */
function isoToLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Convert datetime-local value (local time) → UTC ISO string. */
function localToIso(local: string): string {
  return new Date(local).toISOString()
}

function defaultLocalTime(offsetHours = 0): string {
  const d = new Date()
  d.setHours(d.getHours() + offsetHours, 0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`
}

interface CalendarEventModalProps {
  event: CalendarEvent | null
  defaultStart: string | null
  defaultEnd: string | null
  workspaceId: string
  tasks: Task[]
  /** When the event is linked to a task, open that task (cross-link). */
  onOpenTask?: (taskId: string) => void
  onClose: () => void
}

export function CalendarEventModal({
  event,
  defaultStart,
  defaultEnd,
  workspaceId,
  tasks,
  onOpenTask,
  onClose,
}: CalendarEventModalProps) {
  const isEdit = event !== null

  const [title, setTitle] = useState(event?.title ?? '')
  const [eventType, setEventType] = useState<CalendarEventType>(event?.event_type ?? 'study')
  const [startTime, setStartTime] = useState(
    event ? isoToLocal(event.start_time) : (defaultStart ?? defaultLocalTime(1)),
  )
  const [endTime, setEndTime] = useState(
    event ? isoToLocal(event.end_time) : (defaultEnd ?? defaultLocalTime(2)),
  )
  const [description, setDescription] = useState(event?.description ?? '')
  const [taskId, setTaskId] = useState<string>(event?.task_id ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const createEvent = useCalendarStore((s) => s.createEvent)
  const updateEvent = useCalendarStore((s) => s.updateEvent)
  const deleteEvent = useCalendarStore((s) => s.deleteEvent)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) { setError('Title is required.'); return }
    if (!startTime || !endTime) { setError('Start and end time are required.'); return }

    setSubmitting(true)
    setError('')
    try {
      if (isEdit) {
        await updateEvent(event.id, {
          title: trimmed,
          event_type: eventType,
          start_time: localToIso(startTime),
          end_time: localToIso(endTime),
          description: description.trim() || null,
          task_id: taskId || null,
        })
      } else {
        await createEvent({
          workspace_id: workspaceId,
          title: trimmed,
          event_type: eventType,
          start_time: localToIso(startTime),
          end_time: localToIso(endTime),
          description: description.trim() || undefined,
          task_id: taskId || null,
        })
      }
      onClose()
    } catch {
      setError('Failed to save event. Please try again.')
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!event) return
    setSubmitting(true)
    try {
      await deleteEvent(event.id)
      onClose()
    } catch {
      setError('Failed to delete event.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-7 py-5">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {isEdit ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-7 py-6">
          {/* Title */}
          <div>
            <label htmlFor="cal-title" className="field-label">
              Title
            </label>
            <input
              id="cal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="input"
            />
            {error && <p className="mt-1 text-[var(--text-meta)] text-[var(--color-exam)]">{error}</p>}
          </div>

          {/* Type */}
          <div>
            <label htmlFor="cal-type" className="field-label">
              Type
            </label>
            <select
              id="cal-type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value as CalendarEventType)}
              className="input"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Start / End times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cal-start" className="field-label">
                Start
              </label>
              <input
                id="cal-start"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="cal-end" className="field-label">
                End
              </label>
              <input
                id="cal-end"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="cal-desc" className="field-label">
              Description
            </label>
            <textarea
              id="cal-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional notes…"
              className="input resize-none py-3"
            />
          </div>

          {/* Task link */}
          {tasks.length > 0 && (
            <div>
              <label htmlFor="cal-task" className="field-label">
                Link Task <span className="font-normal text-[var(--text-tertiary)]">(optional)</span>
              </label>
              <select
                id="cal-task"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="input"
              >
                <option value="">None</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Cross-link: jump to the linked task */}
          {isEdit && event.task_id && onOpenTask && (
            <button
              type="button"
              onClick={() => onOpenTask(event.task_id as string)}
              className="flex items-center gap-2 self-start rounded-[var(--radius-control)] border border-[var(--border-default)] px-3.5 py-2 text-[var(--text-base)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            >
              <SquareArrowOutUpRight size={16} />
              Open linked task
            </button>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            {isEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="text-[var(--text-meta)] text-[var(--color-exam)] transition-colors hover:underline disabled:opacity-50"
              >
                Delete event
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving…' : isEdit ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
