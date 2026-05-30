import { Check, GripVertical, Pencil, Trash2 } from 'lucide-react'
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
  isDragging?: boolean
}

export function TaskCard({ task, onEdit, isDragging = false }: TaskCardProps) {
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

  const dueDateLabel = task.due_date
    ? new Date(task.due_date + 'T00:00:00').toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <div
      className={cn(
        'group flex items-start gap-2 rounded-lg border bg-[var(--surface-card)] px-3 py-2.5 transition-colors',
        isDragging
          ? 'border-[var(--border-default)] opacity-60 shadow-[var(--shadow-md)]'
          : 'border-[var(--border-subtle)]',
      )}
    >
      {/* Drag handle */}
      <div className="mt-0.5 cursor-grab text-[var(--text-tertiary)] opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
        <GripVertical size={14} />
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

      {/* Title + description + due date */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm leading-snug text-[var(--text-primary)]',
            task.completed && 'text-[var(--text-tertiary)] line-through',
          )}
        >
          {task.title}
        </p>
        {(task.description || dueDateLabel) && (
          <div className="mt-0.5 flex items-center gap-3">
            {task.description && (
              <p className="truncate text-xs text-[var(--text-tertiary)]">{task.description}</p>
            )}
            {dueDateLabel && (
              <span className="flex-shrink-0 text-xs text-[var(--text-tertiary)]">
                {dueDateLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Priority dot */}
      <div
        className={cn('mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full', PRIORITY_DOT[task.priority])}
        title={task.priority}
      />

      {/* Actions (visible on hover) */}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onEdit(task)}
          disabled={busy}
          className="rounded p-1 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-secondary)]"
          aria-label="Edit task"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={handleDeleteClick}
          disabled={busy}
          className={cn(
            'rounded px-1.5 py-1 text-xs transition-colors',
            confirmDelete
              ? 'bg-[var(--color-exam-muted)] text-[var(--color-exam)]'
              : 'text-[var(--text-tertiary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--color-exam)]',
          )}
          aria-label="Delete task"
        >
          {confirmDelete ? 'Delete?' : <Trash2 size={12} />}
        </button>
      </div>
    </div>
  )
}
