import { Plus } from 'lucide-react'
import { forwardRef, useState } from 'react'

import { useTaskStore } from '../store'

interface TaskInputProps {
  workspaceId: string
}

export const TaskInput = forwardRef<HTMLInputElement, TaskInputProps>(function TaskInput(
  { workspaceId },
  ref,
) {
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
        ref={ref}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task…"
        className="input flex-1"
      />
      <button type="submit" disabled={submitting || !title.trim()} className="btn-primary flex-shrink-0">
        <Plus size={18} />
        Add
      </button>
    </form>
  )
})
