import { Check, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'

import {
  ensureNotificationPermission,
  notifySessionComplete,
  playCompletionChime,
} from '@/features/study/lib/feedback'
import { useStudyStore } from '@/features/study/store'
import { METHOD_LABELS } from '@/features/study/types'
import { useWorkspaceStore } from '@/features/workspace/store'

import { useDashboardInteractions } from '../store/interactions'

/** Render studied time the warm way: "50 min", "1h 05m". */
function formatStudied(seconds: number): string {
  const mins = Math.max(1, Math.round(seconds / 60))
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h}h` : `${h}h ${String(m).padStart(2, '0')}m`
}

/**
 * Soft, encouraging completion experience for a finished study session.
 *
 * A study timer should never end silently — when the session completes we play
 * a gentle chime, fire an optional browser notification, and float a calm
 * blurred overlay celebrating the work. Nothing here touches session business
 * logic; it reacts to the store's `completed` timer status and offers the same
 * next-step actions (new session / repeat / done) the panel used to.
 */
export function SessionCompleteOverlay() {
  const status = useStudyStore((s) => s.timer.status)
  const sessionHistory = useStudyStore((s) => s.sessionHistory)
  const startSession = useStudyStore((s) => s.startSession)
  const dismissCompletion = useStudyStore((s) => s.dismissCompletion)

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const openStudy = useDashboardInteractions((s) => s.openStudy)

  // The just-finished session sits at the head of the history.
  const lastSession = useMemo(
    () => (sessionHistory.length > 0 ? sessionHistory[0] : null),
    [sessionHistory],
  )

  // Request notification permission once a session is actually under way, so the
  // prompt has clear context (rather than ambushing the user on page load).
  const wasRunning = useRef(false)
  useEffect(() => {
    if (status === 'running' && !wasRunning.current) {
      wasRunning.current = true
      ensureNotificationPermission()
    }
    if (status === 'idle') wasRunning.current = false
  }, [status])

  // Fire chime + notification exactly once, on the transition into completion.
  const announced = useRef(false)
  useEffect(() => {
    if (status === 'completed' && !announced.current) {
      announced.current = true
      playCompletionChime()
      const studied = lastSession ? formatStudied(lastSession.actual_duration) : 'a focused stretch'
      notifySessionComplete(`Great work — you studied for ${studied}. Time for a break.`)
    }
    if (status !== 'completed') announced.current = false
  }, [status, lastSession])

  if (status !== 'completed') return null

  const studiedLabel = lastSession ? formatStudied(lastSession.actual_duration) : null

  function repeatLast() {
    if (!lastSession || !activeWorkspace) return
    dismissCompletion()
    void startSession({
      workspace_id: activeWorkspace.id,
      task_id: lastSession.task_id,
      method: lastSession.method,
      blocks: lastSession.blocks.map((b) => ({
        block_type: b.block_type,
        duration_minutes: b.duration_minutes,
        order_index: b.order_index,
      })),
    })
  }

  function newSession() {
    dismissCompletion()
    openStudy({ method: lastSession?.method })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Study session complete"
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{
        backgroundColor: 'var(--overlay)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={dismissCompletion}
    >
      <div
        className="w-full max-w-sm rounded-[var(--radius-modal)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 text-center shadow-[var(--shadow-xl)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success-muted)] text-[var(--color-success)]">
          <Check size={28} strokeWidth={2.25} />
        </div>

        <h2 className="text-[length:var(--text-xl)] font-semibold tracking-tight text-[var(--text-primary)]">
          Session complete
        </h2>
        <p className="mt-2 leading-relaxed text-[var(--text-secondary)]">
          Great work.
          {studiedLabel && (
            <>
              {' '}You studied for{' '}
              <span className="font-medium text-[var(--text-primary)]">{studiedLabel}</span>.
            </>
          )}
          {lastSession && (
            <span className="mt-1 block text-[var(--text-meta)] text-[var(--text-tertiary)]">
              {METHOD_LABELS[lastSession.method]}
            </span>
          )}
        </p>

        <div className="mt-7 flex flex-col gap-2">
          <button onClick={newSession} className="btn-primary w-full">
            Start another session
          </button>
          {lastSession && (
            <button onClick={repeatLast} className="btn-secondary w-full">
              <RotateCcw size={16} />
              Repeat {METHOD_LABELS[lastSession.method]}
            </button>
          )}
          <button
            onClick={dismissCompletion}
            className="mt-1 text-[var(--text-meta)] font-medium text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)]"
          >
            Done for now
          </button>
        </div>
      </div>
    </div>
  )
}
