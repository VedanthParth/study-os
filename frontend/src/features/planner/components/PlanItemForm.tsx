import { useState } from 'react'

import type { Task } from '@/features/tasks/types'

import type { PlanItem, UpdatePlanItemPayload } from '../types'

interface PlanItemFormProps {
  item?: PlanItem
  planId: string
  tasks: Task[]
  onSave: (payload: UpdatePlanItemPayload) => Promise<void>
  onCancel: () => void
}

export function PlanItemForm({ item, tasks, onSave, onCancel }: PlanItemFormProps) {
  const today = new Date().toISOString().slice(0, 10)

  const [title, setTitle] = useState(item?.title ?? '')
  const [reason, setReason] = useState(item?.recommendation_reason ?? '')
  const [date, setDate] = useState(item?.scheduled_date ?? today)
  const [taskId, setTaskId] = useState<string>(item?.task_id ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required.'); return }
    if (!date) { setError('Date is required.'); return }
    setSubmitting(true)
    setError('')
    try {
      await onSave({
        title: title.trim(),
        recommendation_reason: reason.trim() || null,
        scheduled_date: date,
        task_id: taskId || null,
      })
    } catch {
      setError('Failed to save. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-page)] p-3"
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Item title…"
            autoFocus
            className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-default)] focus:outline-none"
          />
        </div>
        <div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--border-default)] focus:outline-none"
          />
        </div>
        <div>
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--border-default)] focus:outline-none"
          >
            <option value="">No linked task</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why this item? (recommendation reason)"
            className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-default)] focus:outline-none"
          />
        </div>
      </div>

      {error && <p className="text-xs text-[var(--color-exam)]">{error}</p>}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-[var(--gray-900)] px-3 py-1.5 text-xs font-medium text-[var(--text-inverse)] hover:bg-[var(--gray-700)] disabled:opacity-50"
        >
          {submitting ? 'Saving…' : item ? 'Save' : 'Add'}
        </button>
      </div>
    </form>
  )
}
