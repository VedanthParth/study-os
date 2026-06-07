import { BookOpen, RotateCcw, SquareArrowOutUpRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { ROUTES } from '@/constants'
import { MethodSelector } from '@/features/study/components/MethodSelector'
import { SessionControls } from '@/features/study/components/SessionControls'
import { SessionProgress } from '@/features/study/components/SessionProgress'
import { StudyTimer } from '@/features/study/components/StudyTimer'
import { useStudyTimer } from '@/features/study/hooks/useStudyTimer'
import { useStudyStore } from '@/features/study/store'
import type { StudyMethod } from '@/features/study/types'
import { METHOD_LABELS } from '@/features/study/types'
import { useTaskStore } from '@/features/tasks/store'
import { useWorkspaceStore } from '@/features/workspace/store'

import { useDashboardInteractions } from '../store/interactions'
import { DashboardPanel, PanelFooterLink, PanelFooterSummary } from './DashboardPanel'

/**
 * Dashboard panel wrapping the study session engine.
 * Owns the timer hook and block-advancement effect so it is self-contained.
 * Session configuration is launched through the shared interaction host; quick
 * actions (repeat last method, open related task) reuse the existing store.
 */
export function StudyPanel() {
  const [selectedMethod, setSelectedMethod] = useState<StudyMethod>('pomodoro')

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const tasks = useTaskStore((s) => s.tasks)

  const activeSession = useStudyStore((s) => s.activeSession)
  const timer = useStudyStore((s) => s.timer)
  const sessionHistory = useStudyStore((s) => s.sessionHistory)
  const startSession = useStudyStore((s) => s.startSession)
  const pauseSession = useStudyStore((s) => s.pauseSession)
  const resumeSession = useStudyStore((s) => s.resumeSession)
  const stopSession = useStudyStore((s) => s.stopSession)
  const advanceBlock = useStudyStore((s) => s.advanceBlock)

  const openStudy = useDashboardInteractions((s) => s.openStudy)
  const openTaskEditor = useDashboardInteractions((s) => s.openTaskEditor)

  // Drive the 1-second tick while running
  useStudyTimer()

  // Block advancement when secondsRemaining hits 0
  useEffect(() => {
    if (timer.status !== 'running' || timer.secondsRemaining > 0 || !activeSession) return
    const isLastBlock = timer.currentBlockIndex >= activeSession.blocks.length - 1
    if (isLastBlock) {
      void stopSession(true)
    } else {
      advanceBlock()
    }
  }, [timer.status, timer.secondsRemaining, timer.currentBlockIndex, activeSession, advanceBlock, stopSession])

  // Most recent finished session — powers "Repeat" one-click start.
  const lastSession = useMemo(() => {
    if (sessionHistory.length === 0) return null
    return [...sessionHistory].sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    )[0]
  }, [sessionHistory])

  if (!activeWorkspace) return null

  const hasActiveSession = activeSession !== null && (timer.status === 'running' || timer.status === 'paused')
  const isCompleted = timer.status === 'completed'
  const currentBlock = hasActiveSession ? activeSession.blocks[timer.currentBlockIndex] : null
  const linkedTask = activeSession?.task_id ? tasks.find((t) => t.id === activeSession.task_id) : undefined

  const studySummary = hasActiveSession
    ? `${METHOD_LABELS[activeSession.method]} in progress`
    : 'Ready to focus'

  function repeatLast() {
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
  }

  return (
    <DashboardPanel
      title="Study Session"
      icon={<BookOpen size={20} strokeWidth={1.75} />}
      active={hasActiveSession}
      footer={
        <>
          <PanelFooterSummary>{studySummary}</PanelFooterSummary>
          <PanelFooterLink to={ROUTES.STUDY}>View History</PanelFooterLink>
        </>
      }
    >
      {/* Completion is surfaced by the soft <SessionCompleteOverlay/> at the
          dashboard level (sound + notification + blurred modal), so the panel
          itself simply returns to its idle "ready to focus" state. */}

      {hasActiveSession && currentBlock && (
        <div className="flex flex-col items-center gap-5">
          <p className="label-eyebrow">
            {METHOD_LABELS[activeSession.method]}
            {linkedTask && <span className="ml-1 normal-case">· {linkedTask.title}</span>}
          </p>
          <StudyTimer
            block={currentBlock}
            secondsRemaining={timer.secondsRemaining}
            totalBlockSeconds={currentBlock.duration_minutes * 60}
            status={timer.status}
          />
          <SessionProgress blocks={activeSession.blocks} currentBlockIndex={timer.currentBlockIndex} />
          <SessionControls
            status={timer.status}
            onPause={() => void pauseSession()}
            onResume={() => void resumeSession()}
            onStop={() => void stopSession(false)}
          />
          {linkedTask && (
            <button
              onClick={() => openTaskEditor(linkedTask.id)}
              className="flex items-center gap-1.5 text-[var(--text-meta)] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)]"
            >
              <SquareArrowOutUpRight size={14} />
              Open related task
            </button>
          )}
        </div>
      )}

      {!hasActiveSession && !isCompleted && (
        <div className="flex flex-col gap-7">
          {lastSession && (
            <button onClick={repeatLast} className="btn-secondary self-start">
              <RotateCcw size={17} />
              Repeat {METHOD_LABELS[lastSession.method]}
            </button>
          )}
          <div className="flex flex-col gap-3.5">
            <p className="label-eyebrow">Choose your focus</p>
            <MethodSelector selected={selectedMethod} onSelect={setSelectedMethod} />
          </div>
          <button onClick={() => openStudy({ method: selectedMethod })} className="btn-primary w-full">
            Configure &amp; Start
          </button>
        </div>
      )}
    </DashboardPanel>
  )
}
