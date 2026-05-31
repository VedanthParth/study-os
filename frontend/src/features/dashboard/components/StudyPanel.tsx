import { BookOpen } from 'lucide-react'
import { useEffect, useState } from 'react'

import { MethodSelector } from '@/features/study/components/MethodSelector'
import { SessionConfigModal } from '@/features/study/components/SessionConfigModal'
import { SessionControls } from '@/features/study/components/SessionControls'
import { SessionProgress } from '@/features/study/components/SessionProgress'
import { StudyTimer } from '@/features/study/components/StudyTimer'
import { useStudyTimer } from '@/features/study/hooks/useStudyTimer'
import { useStudyStore } from '@/features/study/store'
import type { StudyMethod } from '@/features/study/types'
import { METHOD_LABELS } from '@/features/study/types'
import { useTaskStore } from '@/features/tasks/store'
import { useWorkspaceStore } from '@/features/workspace/store'

import { DashboardPanel } from './DashboardPanel'

/**
 * Dashboard panel wrapping the study session engine.
 * Owns the timer hook and block-advancement effect so it is self-contained.
 */
export function StudyPanel() {
  const [selectedMethod, setSelectedMethod] = useState<StudyMethod>('pomodoro')
  const [showConfig, setShowConfig] = useState(false)

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const tasks = useTaskStore((s) => s.tasks)

  const activeSession = useStudyStore((s) => s.activeSession)
  const timer = useStudyStore((s) => s.timer)
  const pauseSession = useStudyStore((s) => s.pauseSession)
  const resumeSession = useStudyStore((s) => s.resumeSession)
  const stopSession = useStudyStore((s) => s.stopSession)
  const advanceBlock = useStudyStore((s) => s.advanceBlock)
  const dismissCompletion = useStudyStore((s) => s.dismissCompletion)

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

  if (!activeWorkspace) return null

  const hasActiveSession = activeSession !== null && (timer.status === 'running' || timer.status === 'paused')
  const isCompleted = timer.status === 'completed'
  const currentBlock = hasActiveSession ? activeSession.blocks[timer.currentBlockIndex] : null

  return (
    <>
      <DashboardPanel title="Study" icon={<BookOpen size={13} />}>
        {isCompleted && (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <p className="text-sm font-medium text-[var(--text-primary)]">Session complete!</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfig(true)}
                className="rounded-md bg-[var(--gray-900)] px-3 py-1.5 text-xs font-medium text-[var(--text-inverse)] hover:bg-[var(--gray-700)]"
              >
                New Session
              </button>
              <button
                onClick={dismissCompletion}
                className="rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:border-[var(--border-default)]"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {hasActiveSession && currentBlock && (
          <div className="flex flex-col items-center gap-4 p-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              {METHOD_LABELS[activeSession.method]}
              {activeSession.task_id && tasks.find((t) => t.id === activeSession.task_id) && (
                <span className="ml-1 normal-case">
                  · {tasks.find((t) => t.id === activeSession.task_id)?.title}
                </span>
              )}
            </p>
            <StudyTimer
              block={currentBlock}
              secondsRemaining={timer.secondsRemaining}
              totalBlockSeconds={currentBlock.duration_minutes * 60}
              status={timer.status}
            />
            <SessionProgress
              blocks={activeSession.blocks}
              currentBlockIndex={timer.currentBlockIndex}
            />
            <SessionControls
              status={timer.status}
              onPause={() => void pauseSession()}
              onResume={() => void resumeSession()}
              onStop={() => void stopSession(false)}
            />
          </div>
        )}

        {!hasActiveSession && !isCompleted && (
          <div className="flex flex-col gap-4 p-4">
            <MethodSelector selected={selectedMethod} onSelect={setSelectedMethod} />
            <button
              onClick={() => setShowConfig(true)}
              className="self-start rounded-lg bg-[var(--gray-900)] px-4 py-2 text-xs font-medium text-[var(--text-inverse)] hover:bg-[var(--gray-700)]"
            >
              Configure &amp; Start
            </button>
          </div>
        )}
      </DashboardPanel>

      {showConfig && (
        <SessionConfigModal
          method={selectedMethod}
          workspaceId={activeWorkspace.id}
          tasks={tasks}
          onClose={() => setShowConfig(false)}
        />
      )}
    </>
  )
}
