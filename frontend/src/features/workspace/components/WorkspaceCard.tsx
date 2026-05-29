import { Check, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import type { Workspace } from '../types'
import { WORKSPACE_TYPE_LABELS } from '../types'

interface WorkspaceCardProps {
  workspace: Workspace
  isActive: boolean
  onActivate: (workspace: Workspace) => void
  onRename: (id: string, name: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function WorkspaceCard({
  workspace,
  isActive,
  onActivate,
  onRename,
  onDelete,
}: WorkspaceCardProps) {
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(workspace.name)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (renaming) inputRef.current?.focus()
  }, [renaming])

  useEffect(
    () => () => {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    },
    [],
  )

  function startRename() {
    setRenameValue(workspace.name)
    setRenaming(true)
  }

  async function submitRename() {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== workspace.name) {
      setBusy(true)
      await onRename(workspace.id, trimmed)
      setBusy(false)
    }
    setRenaming(false)
  }

  function cancelRename() {
    setRenameValue(workspace.name)
    setRenaming(false)
  }

  function handleDeleteClick() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      deleteTimerRef.current = setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    setBusy(true)
    onDelete(workspace.id).catch(() => setBusy(false))
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-3 rounded-lg border bg-[var(--surface-card)] p-5 shadow-[var(--shadow-sm)] transition-colors',
        isActive
          ? 'border-[var(--gray-700)]'
          : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]',
      )}
    >
      {/* Active badge */}
      {isActive && (
        <span className="absolute right-4 top-4 rounded-full bg-[var(--gray-900)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--text-inverse)]">
          Active
        </span>
      )}

      {/* Type badge */}
      <span className="inline-flex w-fit rounded-full border border-[var(--border-subtle)] px-2.5 py-0.5 text-[11px] text-[var(--text-tertiary)]">
        {WORKSPACE_TYPE_LABELS[workspace.type]}
      </span>

      {/* Name / rename input */}
      {renaming ? (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void submitRename()
              if (e.key === 'Escape') cancelRename()
            }}
            className="flex-1 rounded-md border border-[var(--border-default)] bg-[var(--surface-page)] px-2 py-1 text-sm font-semibold text-[var(--text-primary)] focus:outline-none"
          />
          <button
            onClick={() => void submitRename()}
            disabled={busy}
            className="rounded p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <Check size={14} />
          </button>
          <button
            onClick={cancelRename}
            className="rounded p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <p className="text-sm font-semibold text-[var(--text-primary)]">{workspace.name}</p>
      )}

      {/* Actions */}
      <div className="mt-auto flex items-center gap-1 pt-1">
        {!isActive && (
          <button
            onClick={() => onActivate(workspace)}
            className="mr-auto rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--border-default)] hover:text-[var(--text-primary)]"
          >
            Switch
          </button>
        )}
        {isActive && <div className="mr-auto" />}

        <button
          onClick={startRename}
          disabled={busy || renaming}
          className="rounded p-1.5 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-secondary)]"
          title="Rename"
        >
          <Pencil size={13} />
        </button>

        <button
          onClick={handleDeleteClick}
          disabled={busy}
          className={cn(
            'rounded px-2 py-1.5 text-xs transition-colors',
            confirmDelete
              ? 'bg-[var(--color-exam-muted)] text-[var(--color-exam)]'
              : 'text-[var(--text-tertiary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--color-exam)]',
          )}
          title="Delete"
        >
          {confirmDelete ? (
            'Confirm?'
          ) : (
            <Trash2 size={13} />
          )}
        </button>
      </div>
    </div>
  )
}
