import { useState } from 'react'

import { useWorkspaceStore } from '../store'
import type { WorkspaceType } from '../types'
import { WorkspaceTypeCard } from './WorkspaceTypeCard'

const TYPES: WorkspaceType[] = ['semester', 'competitive', 'research', 'self_learning']

interface CreateWorkspaceModalProps {
  onClose: () => void
}

export function CreateWorkspaceModal({ onClose }: CreateWorkspaceModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<WorkspaceType>('semester')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const createWorkspace = useWorkspaceStore((s) => s.createWorkspace)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Workspace name is required.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await createWorkspace({ name: trimmed, type })
      onClose()
    } catch {
      setError('Failed to create workspace. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-lg)]">
        <div className="border-b border-[var(--border-subtle)] px-6 py-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            New Workspace
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="mb-5">
            <label
              htmlFor="workspace-name"
              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
            >
              Name
            </label>
            <input
              id="workspace-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fall 2026 Semester"
              autoFocus
              className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-default)] focus:outline-none"
            />
            {error && <p className="mt-1.5 text-xs text-[var(--color-exam)]">{error}</p>}
          </div>

          <div className="mb-6">
            <p className="mb-2 text-xs font-medium text-[var(--text-secondary)]">Type</p>
            <div className="flex flex-col gap-2">
              {TYPES.map((t) => (
                <WorkspaceTypeCard
                  key={t}
                  type={t}
                  selected={type === t}
                  onSelect={setType}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-[var(--gray-900)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--gray-700)] disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
