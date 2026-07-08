import { useCallback, useEffect, useMemo } from 'react'

import { useWorkspaceStore } from '@/features/workspace/store'

import { useStudyStore } from '../store'
import type { SessionBlock, StudySession, TimerSlice } from '../types'
import { useStudyTimer } from './useStudyTimer'

/**
 * Single source of truth for study-session orchestration, shared by the
 * dedicated Study page and the dashboard Study panel.
 *
 * It owns the 1-second tick and the block-advancement effect (when a block hits
 * 0, advance — or finish the session on the last block), and exposes the derived
 * state both surfaces need. The two views differ only in chrome and in how they
 * launch a new session, so that stays in the components.
 */
export interface StudySessionController {
  activeSession: StudySession | null
  timer: TimerSlice
  hasActiveSession: boolean
  isCompleted: boolean
  currentBlock: SessionBlock | null
  /** Most recent finished session — powers one-click "repeat". */
  lastSession: StudySession | null
  pause: () => void
  resume: () => void
  stop: (completed?: boolean) => void
  dismissCompletion: () => void
  repeatLast: () => void
}

export function useStudySession(): StudySessionController {
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)

  const activeSession = useStudyStore((s) => s.activeSession)
  const timer = useStudyStore((s) => s.timer)
  const sessionHistory = useStudyStore((s) => s.sessionHistory)
  const startSession = useStudyStore((s) => s.startSession)
  const pauseSession = useStudyStore((s) => s.pauseSession)
  const resumeSession = useStudyStore((s) => s.resumeSession)
  const stopSession = useStudyStore((s) => s.stopSession)
  const advanceBlock = useStudyStore((s) => s.advanceBlock)
  const dismissCompletion = useStudyStore((s) => s.dismissCompletion)

  // Drive the 1-second tick while running.
  useStudyTimer()

  // Block advancement: when the current block reaches 0, advance to the next —
  // or finish (and mark complete) when it was the last block.
  useEffect(() => {
    if (timer.status !== 'running' || timer.secondsRemaining > 0 || !activeSession) return
    const isLastBlock = timer.currentBlockIndex >= activeSession.blocks.length - 1
    if (isLastBlock) {
      void stopSession(true)
    } else {
      advanceBlock()
    }
  }, [timer.status, timer.secondsRemaining, timer.currentBlockIndex, activeSession, advanceBlock, stopSession])

  const hasActiveSession =
    activeSession !== null && (timer.status === 'running' || timer.status === 'paused')
  const isCompleted = timer.status === 'completed'
  const currentBlock = hasActiveSession ? activeSession.blocks[timer.currentBlockIndex] : null

  const lastSession = useMemo(() => {
    if (sessionHistory.length === 0) return null
    return [...sessionHistory].sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    )[0]
  }, [sessionHistory])

  const repeatLast = useCallback(() => {
    if (!lastSession || !activeWorkspace) return
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
  }, [lastSession, activeWorkspace, startSession])

  return {
    activeSession,
    timer,
    hasActiveSession,
    isCompleted,
    currentBlock,
    lastSession,
    pause: () => void pauseSession(),
    resume: () => void resumeSession(),
    stop: (completed?: boolean) => void stopSession(completed),
    dismissCompletion,
    repeatLast,
  }
}
