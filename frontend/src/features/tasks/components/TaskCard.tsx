import { CalendarClock, Check, GripVertical, Pencil, Play, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { useTaskStore } from '../store'
import type { Task, TaskPriority } from '../types'

const PRIORITY_DOT: Record<TaskPriority, string> = {
  low: 'bg-[var(--border-default)]',
  medium: 'bg-[var(--color-study)]',
  high: 'bg-[var(--color-exam)]',
}

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  /** Start a study session pre-linked to this task (dashboard quick action). */
  onStartStudy?: (task: Task) => void
  /** Open the calendar event linked to this task, when one exists. */
  onOpenEvent?: (task: Task) => void
  hasLinkedEvent?: boolean
  isDragging?: boolean
}

export function TaskCard({
  task,
  onEdit,
  onStartStudy,
  onOpenEvent,
  hasLinkedEvent = false,
  isDragging = false,
}: TaskCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateTask = useTaskStore((s) => s.updateTask)
  const deleteTask = useTaskStore((s) => s.deleteTask)

  async function toggleComplete() {
    if (busy) return
    setBusy(true)
    try {
      await updateTask(task.id, { completed: !task.completed })
    } finally {
      setBusy(false)
    }
  }

  function handleDeleteClick() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      deleteTimerRef.current = setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    setBusy(true)
    deleteTask(task.id).catch(() => {
      setBusy(false)
      setConfirmDelete(false)
    })
  }

  const dueDate = task.due_date ? new Date(task.due_date + 'T00:00:00') : null
  const dueDateLabel = dueDate
    ? dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const isOverdue = !!dueDate && !task.completed && dueDate < startOfToday

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 transition-colors',
        isDragging
          ? 'border-[var(--border-default)] opacity-60 shadow-[var(--shadow-md)]'
          : 'border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-[var(--border-default)]',
        task.completed && !isDragging && 'opacity-60',
      )}
    >
      {/* Drag handle */}
      <div className="mt-0.5 cursor-grab text-[var(--text-tertiary)] opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
        <GripVertical size={13} />
      </div>

      {/* Complete checkbox */}
      <button
        onClick={toggleComplete}
        disabled={busy}
        className={cn(
          'mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors',
          task.completed
            ? 'border-[var(--gray-400)] bg-[var(--gray-400)]'
            : 'border-[var(--border-default)] hover:border-[var(--border-strong)]',
        )}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed && <Check size={10} className="text-[var(--text-inverse)]" />}
      </button>

      {/* Title (+ optional description) */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-base leading-snug text-[var(--text-primary)]',
            task.completed && 'text-[var(--text-tertiary)] line-through',
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 truncate text-[var(--text-meta)] text-[var(--text-tertiary)]">
            {task.description}
          </p>
        )}
      </div>

      {/* Due date — colour-coded so it is easy to notice (overdue stands out) */}
      {dueDateLabel && (
        <span
          className={cn(
            'mt-0.5 inline-flex flex-shrink-0 items-center gap-1 rounded-[var(--radius-chip)] px-1.5 py-0.5 text-[11px] font-medium',
            isOverdue
              ? 'bg-[var(--color-exam-muted)] text-[var(--color-exam)]'
              : 'bg-[var(--surface-sunken)] text-[var(--text-secondary)]',
            task.completed && 'opacity-70',
          )}
          title={isOverdue ? 'Overdue' : 'Due date'}
        >
          <CalendarClock size={11} />
          {dueDateLabel}
        </span>
      )}

      {/* Priority dot */}
      <div
        className={cn('mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full', PRIORITY_DOT[task.priority])}
        title={task.priority}
      />

      {/* Actions (visible on hover) */}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        {onStartStudy && !task.completed && (
          <button
            onClick={() => onStartStudy(task)}
            disabled={busy}
            className="rounded p-1.5 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--color-study)]"
            aria-label="Start study session"
            title="Start study session"
          >
            <Play size={14} />
          </button>
        )}
        {onOpenEvent && hasLinkedEvent && (
          <button
            onClick={() => onOpenEvent(task)}
            disabled={busy}
            className="rounded p-1.5 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-secondary)]"
            aria-label="Open linked event"
            title="Open linked event"
          >
            <CalendarClock size={14} />
          </button>
        )}
        <button
          onClick={() => onEdit(task)}
          disabled={busy}
          className="rounded p-1.5 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-secondary)]"
          aria-label="Edit task"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={handleDeleteClick}
          disabled={busy}
          className={cn(
            'rounded px-1.5 py-1.5 text-xs transition-colors',
            confirmDelete
              ? 'bg-[var(--color-exam-muted)] text-[var(--color-exam)]'
              : 'text-[var(--text-tertiary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--color-exam)]',
          )}
          aria-label="Delete task"
        >
          {confirmDelete ? 'Delete?' : <Trash2 size={14} />}
        </button>
      </div>
    </div>
  )
}
