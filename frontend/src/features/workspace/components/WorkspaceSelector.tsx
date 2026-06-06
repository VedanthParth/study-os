import { ChevronDown, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { useWorkspaceStore } from '../store'
import { WORKSPACE_TYPE_LABELS } from '../types'

interface WorkspaceSelectorProps {
  /** Optional hook to open the management modal from the dropdown footer. */
  onManage?: () => void
}

export function WorkspaceSelector({ onManage }: WorkspaceSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!activeWorkspace) return null

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[var(--control-h-sm)] items-center gap-2 rounded-[var(--radius-control)] border border-[var(--border-default)] bg-[var(--surface-card)] px-3.5 text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)]"
      >
        <span className="max-w-[200px] truncate text-base font-semibold tracking-tight">
          {activeWorkspace.name}
        </span>
        <ChevronDown size={16} className="flex-shrink-0 text-[var(--text-tertiary)]" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-72 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] py-1.5 shadow-[var(--shadow-lg)]">
          {workspaces.map((w) => (
            <button
              key={w.id}
              onClick={() => {
                setActiveWorkspace(w)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[var(--text-md)] transition-colors',
                w.id === activeWorkspace.id
                  ? 'bg-[var(--surface-sunken)] font-medium text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'h-2 w-2 flex-shrink-0 rounded-full',
                  w.id === activeWorkspace.id ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]',
                )}
              />
              <span className="flex-1 truncate">{w.name}</span>
              <span className="text-[var(--text-meta)] text-[var(--text-tertiary)]">
                {WORKSPACE_TYPE_LABELS[w.type].split(' ')[0]}
              </span>
            </button>
          ))}

          {onManage && (
            <>
              <div className="my-1.5 border-t border-[var(--border-subtle)]" />
              <button
                onClick={() => {
                  setOpen(false)
                  onManage()
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[var(--text-md)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
              >
                <Plus size={17} />
                New / manage workspaces
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
