import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { useWorkspaceStore } from '../store'
import { WORKSPACE_TYPE_LABELS } from '../types'

export function WorkspaceSelector() {
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
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1.5 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--border-default)]"
      >
        <span className="max-w-[140px] truncate font-medium">{activeWorkspace.name}</span>
        <ChevronDown size={14} className="flex-shrink-0 text-[var(--text-tertiary)]" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] py-1 shadow-[var(--shadow-md)]">
          {workspaces.map((w) => (
            <button
              key={w.id}
              onClick={() => {
                setActiveWorkspace(w)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                w.id === activeWorkspace.id
                  ? 'bg-[var(--surface-sunken)] font-medium text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]',
              )}
            >
              <span className="flex-1 truncate">{w.name}</span>
              <span className="text-xs text-[var(--text-tertiary)]">
                {WORKSPACE_TYPE_LABELS[w.type]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
