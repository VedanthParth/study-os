import { Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'

import type { Task } from '@/features/tasks/types'
import { cn } from '@/lib/utils'

import { useStudyStore } from '../store'
import type { BlockType, SessionBlockConfig, StudyMethod } from '../types'
import { BLOCK_TYPE_LABELS, METHOD_LABELS, METHOD_PRESETS } from '../types'

const BLOCK_TYPES: BlockType[] = ['study', 'short-break', 'long-break']

function totalMinutes(blocks: SessionBlockConfig[]): number {
  return blocks.reduce((s, b) => s + b.duration_minutes, 0)
}

interface SessionConfigModalProps {
  method: StudyMethod
  workspaceId: string
  tasks: Task[]
  /** Pre-link the session to a task (e.g. "Start study session" from a task). */
  defaultTaskId?: string | null
  onClose: () => void
}

export function SessionConfigModal({
  method,
  workspaceId,
  tasks,
  defaultTaskId,
  onClose,
}: SessionConfigModalProps) {
  const presetBlocks = method !== 'custom' ? METHOD_PRESETS[method] : []
  const [customBlocks, setCustomBlocks] = useState<SessionBlockConfig[]>(
    method === 'custom'
      ? [{ block_type: 'study', duration_minutes: 25, order_index: 0 }]
      : [],
  )
  const [taskId, setTaskId] = useState(defaultTaskId ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const startSession = useStudyStore((s) => s.startSession)

  const blocks = method === 'custom' ? customBlocks : presetBlocks
  const planned = totalMinutes(blocks)

  function addCustomBlock() {
    setCustomBlocks((prev) => [
      ...prev,
      {
        block_type: 'study',
        duration_minutes: 25,
        order_index: prev.length,
      },
    ])
  }

  function removeCustomBlock(index: number) {
    setCustomBlocks((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((b, i) => ({ ...b, order_index: i })),
    )
  }

  function updateCustomBlock(index: number, field: 'block_type' | 'duration_minutes', value: BlockType | number) {
    setCustomBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)),
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (blocks.length === 0) { setError('Add at least one block.'); return }
    if (!blocks.some((b) => b.block_type === 'study')) { setError('At least one study block is required.'); return }

    setSubmitting(true)
    setError('')
    try {
      await startSession({
        workspace_id: workspaceId,
        task_id: taskId || null,
        method,
        blocks: blocks.map((b, i) => ({ ...b, order_index: i })),
      })
      onClose()
    } catch {
      setError('Failed to start session. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg rounded-[var(--radius-panel)] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-7 py-5">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {METHOD_LABELS[method]}
          </h2>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-7 py-6">
          {/* Block list */}
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--text-secondary)]">
              Session Blocks
              <span className="ml-2 font-normal text-[var(--text-tertiary)]">
                {planned} min total
              </span>
            </p>

            {method !== 'custom' ? (
              /* Preset: read-only display */
              <div className="flex flex-col gap-1.5">
                {presetBlocks.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--surface-page)] px-3 py-2"
                  >
                    <span className="text-xs text-[var(--text-secondary)]">
                      {BLOCK_TYPE_LABELS[b.block_type]}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {b.duration_minutes} min
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              /* Custom: editable list */
              <div className="flex flex-col gap-2">
                {customBlocks.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      value={b.block_type}
                      onChange={(e) => updateCustomBlock(i, 'block_type', e.target.value as BlockType)}
                      className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-page)] px-2 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--border-default)] focus:outline-none"
                    >
                      {BLOCK_TYPES.map((t) => (
                        <option key={t} value={t}>{BLOCK_TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      max={480}
                      value={b.duration_minutes}
                      onChange={(e) => updateCustomBlock(i, 'duration_minutes', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-page)] px-2 py-1.5 text-center text-xs text-[var(--text-primary)] focus:border-[var(--border-default)] focus:outline-none"
                    />
                    <span className="text-xs text-[var(--text-tertiary)]">min</span>
                    <button
                      type="button"
                      onClick={() => removeCustomBlock(i)}
                      disabled={customBlocks.length === 1}
                      className="rounded p-1 text-[var(--text-tertiary)] hover:text-[var(--color-exam)] disabled:opacity-30"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCustomBlock}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md border border-dashed border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-tertiary)] transition-colors',
                    'hover:border-[var(--border-default)] hover:text-[var(--text-secondary)]',
                  )}
                >
                  <Plus size={12} />
                  Add block
                </button>
              </div>
            )}

            {error && <p className="mt-2 text-xs text-[var(--color-exam)]">{error}</p>}
          </div>

          {/* Optional task link */}
          {tasks.length > 0 && (
            <div>
              <label htmlFor="study-task" className="field-label">
                Link Task <span className="font-normal text-[var(--text-tertiary)]">(optional)</span>
              </label>
              <select
                id="study-task"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="input"
              >
                <option value="">None</option>
                {tasks.filter((t) => !t.completed).map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Starting…' : 'Start Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
