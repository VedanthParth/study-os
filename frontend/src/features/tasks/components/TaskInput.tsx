import { Plus } from 'lucide-react'
import { useState } from 'react'

import { useTaskStore } from '../store'

interface TaskInputProps {
  workspaceId: string
}

export function TaskInput({ workspaceId }: TaskInputProps) {
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const createTask = useTaskStore((s) => s.createTask)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    try {
      await createTask({ workspace_id: workspaceId, title: trimmed })
      setTitle('')
    } catch {
      // keep title in input so user can retry
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task…"
        className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-default)] focus:outline-none"
      />
      <button
        type="submit"
        disabled={submitting || !title.trim()}
        className="flex items-center gap-1.5 rounded-md bg-[var(--gray-900)] px-3 py-2 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--gray-700)] disabled:opacity-40"
      >
        <Plus size={14} />
        Add
      </button>
    </form>
  )
}
