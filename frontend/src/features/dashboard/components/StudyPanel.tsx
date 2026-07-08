import { BookOpen, RotateCcw, SquareArrowOutUpRight } from 'lucide-react'
import { useState } from 'react'

import { ROUTES } from '@/constants'
import { MethodSelector } from '@/features/study/components/MethodSelector'
import { SessionControls } from '@/features/study/components/SessionControls'
import { SessionProgress } from '@/features/study/components/SessionProgress'
import { StudyTimer } from '@/features/study/components/StudyTimer'
import { useStudySession } from '@/features/study/hooks/useStudySession'
import type { StudyMethod } from '@/features/study/types'
import { METHOD_LABELS } from '@/features/study/types'
import { useTaskStore } from '@/features/tasks/store'
import { useWorkspaceStore } from '@/features/workspace/store'

import { useDashboardInteractions } from '../store/interactions'
import { DashboardPanel, PanelFooterLink, PanelFooterSummary } from './DashboardPanel'

/**
 * Dashboard panel wrapping the study session engine. Session orchestration (the
 * tick, block advancement, derived state) lives in the shared useStudySession
 * hook; this panel adds the dashboard chrome and launches new sessions through
 * the shared interaction host.
 */
export function StudyPanel() {
  const [selectedMethod, setSelectedMethod] = useState<StudyMethod>('pomodoro')

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const tasks = useTaskStore((s) => s.tasks)

  const openStudy = useDashboardInteractions((s) => s.openStudy)
  const openTaskEditor = useDashboardInteractions((s) => s.openTaskEditor)

  const { activeSession, timer, hasActiveSession, isCompleted, currentBlock, lastSession, pause, resume, stop, repeatLast } =
    useStudySession()

  if (!activeWorkspace) return null

  const linkedTask = activeSession?.task_id ? tasks.find((t) => t.id === activeSession.task_id) : undefined
  const studySummary =
    hasActiveSession && activeSession ? `${METHOD_LABELS[activeSession.method]} in progress` : 'Ready to focus'

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

      {activeSession && currentBlock && (
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
            onPause={pause}
            onResume={resume}
            onStop={() => stop(false)}
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
