import { Plus, X } from 'lucide-react'
import { useState } from 'react'

import { useWorkspaceStore } from '../store'
import type { WorkspaceType } from '../types'
import { WorkspaceCard } from './WorkspaceCard'
import { WorkspaceTypeCard } from './WorkspaceTypeCard'

const TYPES: WorkspaceType[] = ['semester', 'competitive', 'research', 'self-learning']

interface WorkspaceManagementModalProps {
  onClose: () => void
}

/**
 * Full workspace management surface — create / rename / delete / switch — usable
 * from the Dashboard and the sidebar without navigating to a separate page.
 * All mutations go through the existing workspace store; no new business logic.
 */
export function WorkspaceManagementModal({ onClose }: WorkspaceManagementModalProps) {
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace)
  const createWorkspace = useWorkspaceStore((s) => s.createWorkspace)
  const updateWorkspace = useWorkspaceStore((s) => s.updateWorkspace)
  const deleteWorkspace = useWorkspaceStore((s) => s.deleteWorkspace)

  const [name, setName] = useState('')
  const [type, setType] = useState<WorkspaceType>('semester')
  const [showTypes, setShowTypes] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
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
      setName('')
      setType('semester')
      setShowTypes(false)
    } catch {
      setError('Failed to create workspace. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRename(id: string, newName: string) {
    await updateWorkspace(id, { name: newName })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-lg)]">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-8 py-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Workspaces
            </h2>
            <p className="mt-1 text-[var(--text-meta)] text-[var(--text-tertiary)]">
              Create, switch between, and manage your study spaces.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Create */}
          <form onSubmit={handleCreate} className="mb-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1">
                <label htmlFor="ws-create-name" className="field-label">
                  New workspace
                </label>
                <input
                  id="ws-create-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setShowTypes(true)}
                  placeholder="e.g. GRE 2026"
                  className="input"
                />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary mt-0 sm:mt-[26px]">
                <Plus size={18} />
                {submitting ? 'Creating…' : 'Create'}
              </button>
            </div>
            {error && <p className="mt-2 text-[var(--text-meta)] text-[var(--color-exam)]">{error}</p>}

            {showTypes && (
              <div className="mt-4">
                <p className="field-label">Type</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {TYPES.map((t) => (
                    <WorkspaceTypeCard key={t} type={t} selected={type === t} onSelect={setType} />
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Existing */}
          <p className="label-eyebrow mb-3">Your workspaces</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {workspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                isActive={activeWorkspace?.id === workspace.id}
                onActivate={setActiveWorkspace}
                onRename={handleRename}
                onDelete={deleteWorkspace}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
