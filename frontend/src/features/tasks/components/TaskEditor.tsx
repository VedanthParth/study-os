import { X } from 'lucide-react'
import { useState } from 'react'

import { useTaskStore } from '../store'
import type { Task, TaskPriority } from '../types'
import { TASK_PRIORITY_LABELS } from '../types'

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']

interface TaskEditorProps {
  task: Task
  onClose: () => void
}

export function TaskEditor({ task, onClose }: TaskEditorProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [dueDate, setDueDate] = useState(task.due_date ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const updateTask = useTaskStore((s) => s.updateTask)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setError('Title is required.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await updateTask(task.id, {
        title: trimmed,
        description: description.trim() || null,
        priority,
        due_date: dueDate || null,
      })
      onClose()
    } catch {
      setError('Failed to save. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-7 py-5">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Edit Task</h2>
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
            <label htmlFor="task-title" className="field-label">
              Title
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="input"
            />
            {error && <p className="mt-1 text-[var(--text-meta)] text-[var(--color-exam)]">{error}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="field-label">
              Description
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional notes…"
              className="input resize-none py-3"
            />
          </div>

          {/* Priority + Due date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-priority" className="field-label">
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="input"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {TASK_PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-due-date" className="field-label">
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
