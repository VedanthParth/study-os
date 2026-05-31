import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import type { Task } from '@/features/tasks/types'

import { usePlannerStore } from '../store'
import type { CreatePlanItemPayload, StudyPlan } from '../types'

interface DraftItem extends CreatePlanItemPayload {
  _key: number  // local key for React rendering
}

interface PlanEditorProps {
  plan?: StudyPlan | null  // null = create mode
  workspaceId: string
  tasks: Task[]
  onSave: (plan: StudyPlan) => void
  onCancel: () => void
}

let keyCounter = 0
function nextKey() { return ++keyCounter }

const today = new Date().toISOString().slice(0, 10)

export function PlanEditor({ plan, workspaceId, tasks, onSave, onCancel }: PlanEditorProps) {
  const isEdit = plan !== null && plan !== undefined

  const [title, setTitle] = useState(plan?.title ?? '')
  const [description, setDescription] = useState(plan?.description ?? '')
  const [draftItems, setDraftItems] = useState<DraftItem[]>(
    isEdit
      ? [] // in edit mode, items are managed in PlanViewer; editor handles metadata only
      : [{ _key: nextKey(), title: '', scheduled_date: today, recommendation_reason: '', order_index: 0 }],
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const createPlan = usePlannerStore((s) => s.createPlan)
  const updatePlan = usePlannerStore((s) => s.updatePlan)

  function addDraftItem() {
    setDraftItems((prev) => [
      ...prev,
      { _key: nextKey(), title: '', scheduled_date: today, recommendation_reason: '', order_index: prev.length },
    ])
  }

  function updateDraftItem(key: number, field: keyof CreatePlanItemPayload, value: string | null) {
    setDraftItems((prev) => prev.map((d) => d._key === key ? { ...d, [field]: value } : d))
  }

  function removeDraftItem(key: number) {
    setDraftItems((prev) => prev.filter((d) => d._key !== key).map((d, i) => ({ ...d, order_index: i })))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) { setError('Title is required.'); return }

    if (!isEdit) {
      const validItems = draftItems.filter((d) => d.title.trim())
      if (draftItems.some((d) => !d.title.trim())) { setError('All items must have a title.'); return }
      if (validItems.some((d) => !d.scheduled_date)) { setError('All items must have a date.'); return }
    }

    setSubmitting(true)
    setError('')
    try {
      if (isEdit) {
        const saved = await updatePlan(plan.id, {
          title: trimmedTitle,
          description: description.trim() || null,
        })
        onSave(saved)
      } else {
        const items = draftItems
          .filter((d) => d.title.trim())
          .map((d, i) => ({
            title: d.title.trim(),
            scheduled_date: d.scheduled_date || today,
            recommendation_reason: d.recommendation_reason?.trim() || undefined,
            task_id: d.task_id || null,
            order_index: i,
          }))
        const saved = await createPlan({ workspace_id: workspaceId, title: trimmedTitle, description: description.trim() || undefined, items })
        onSave(saved)
      }
    } catch {
      setError('Failed to save plan. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
          {isEdit ? 'Edit Plan' : 'New Plan'}
        </h2>

        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              placeholder="e.g. Week 1 Study Plan"
              className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--border-default)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Description <span className="font-normal text-[var(--text-tertiary)]">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Plan goals or scope…"
              className="w-full resize-none rounded-md border border-[var(--border-subtle)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-default)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Items section — only in create mode */}
      {!isEdit && (
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--text-secondary)]">Plan Items</p>
          <div className="flex flex-col gap-2">
            {draftItems.map((item) => (
              <div key={item._key} className="flex flex-col gap-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-page)] p-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateDraftItem(item._key, 'title', e.target.value)}
                    placeholder="Item title…"
                    className="flex-1 rounded border border-[var(--border-subtle)] bg-[var(--surface-card)] px-2 py-1 text-xs text-[var(--text-primary)] focus:border-[var(--border-default)] focus:outline-none"
                  />
                  <input
                    type="date"
                    value={item.scheduled_date}
                    onChange={(e) => updateDraftItem(item._key, 'scheduled_date', e.target.value)}
                    className="rounded border border-[var(--border-subtle)] bg-[var(--surface-card)] px-2 py-1 text-xs text-[var(--text-primary)] focus:border-[var(--border-default)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeDraftItem(item._key)}
                    disabled={draftItems.length === 1}
                    className="rounded p-1 text-[var(--text-tertiary)] hover:text-[var(--color-exam)] disabled:opacity-30"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.recommendation_reason ?? ''}
                    onChange={(e) => updateDraftItem(item._key, 'recommendation_reason', e.target.value)}
                    placeholder="Why this item? (recommendation reason)"
                    className="flex-1 rounded border border-[var(--border-subtle)] bg-[var(--surface-card)] px-2 py-1 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-default)] focus:outline-none"
                  />
                  <select
                    value={item.task_id ?? ''}
                    onChange={(e) => updateDraftItem(item._key, 'task_id', e.target.value || null)}
                    className="rounded border border-[var(--border-subtle)] bg-[var(--surface-card)] px-2 py-1 text-xs text-[var(--text-primary)] focus:border-[var(--border-default)] focus:outline-none"
                  >
                    <option value="">No task</option>
                    {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addDraftItem}
            className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          >
            <Plus size={11} />
            Add another item
          </button>
        </div>
      )}

      {error && <p className="text-xs text-[var(--color-exam)]">{error}</p>}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-[var(--gray-900)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] hover:bg-[var(--gray-700)] disabled:opacity-50"
        >
          {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Plan'}
        </button>
      </div>
    </form>
  )
}
