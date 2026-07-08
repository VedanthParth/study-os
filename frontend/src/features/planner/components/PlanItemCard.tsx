import { Check, MessageSquare, Pencil, Tag, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'

import { cn } from '@/utils/cn'

import type { PlanItem } from '../types'

function formatDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

interface PlanItemCardProps {
  item: PlanItem
  taskTitle?: string
  onToggleComplete: (id: string, completed: boolean) => Promise<void>
  onEdit: (item: PlanItem) => void
  onDelete: (id: string) => Promise<void>
}

export function PlanItemCard({
  item,
  taskTitle,
  onToggleComplete,
  onEdit,
  onDelete,
}: PlanItemCardProps) {
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function handleToggle() {
    if (busy) return
    setBusy(true)
    try { await onToggleComplete(item.id, !item.completed) }
    finally { setBusy(false) }
  }

  function handleDeleteClick() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      timerRef.current = setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    setBusy(true)
    onDelete(item.id).catch(() => { setBusy(false); setConfirmDelete(false) })
  }

  return (
    <div className="group flex items-start gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 transition-colors">
      {/* Complete checkbox */}
      <button
        onClick={handleToggle}
        disabled={busy}
        className={cn(
          'mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors',
          item.completed
            ? 'border-[var(--color-success)] bg-[var(--color-success)]'
            : 'border-[var(--border-default)] hover:border-[var(--border-strong)]',
        )}
        aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {item.completed && <Check size={10} className="text-[var(--text-inverse)]" />}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={cn(
          'text-sm text-[var(--text-primary)]',
          item.completed && 'text-[var(--text-tertiary)] line-through',
        )}>
          {item.title}
        </p>

        {/* recommendation_reason — prominently displayed */}
        {item.recommendation_reason && (
          <div className="mt-1.5 flex items-start gap-1.5 rounded-md bg-[var(--surface-page)] px-2.5 py-1.5">
            <MessageSquare size={11} className="mt-0.5 flex-shrink-0 text-[var(--color-planner)]" />
            <p className="text-[11px] italic text-[var(--text-secondary)]">
              {item.recommendation_reason}
            </p>
          </div>
        )}

        {/* Meta: date + linked task */}
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <span>{formatDate(item.scheduled_date)}</span>
          {taskTitle && (
            <span className="flex items-center gap-1">
              <Tag size={10} />
              {taskTitle}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onEdit(item)}
          disabled={busy}
          className="rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-secondary)]"
          aria-label="Edit item"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={handleDeleteClick}
          disabled={busy}
          className={cn(
            'rounded px-1.5 py-1 text-xs transition-colors',
            confirmDelete
              ? 'bg-[var(--color-exam-muted)] text-[var(--color-exam)]'
              : 'text-[var(--text-tertiary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--color-exam)]',
          )}
          aria-label="Delete item"
        >
          {confirmDelete ? 'Delete?' : <Trash2 size={12} />}
        </button>
      </div>
    </div>
  )
}
