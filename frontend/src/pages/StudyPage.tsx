import { BookOpen } from 'lucide-react'
import { useEffect, useState } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { PageContainer } from '@/components/ui/PageContainer'
import { TopBar } from '@/components/ui/TopBar'
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

export function StudyPage() {
  const [selectedMethod, setSelectedMethod] = useState<StudyMethod>('pomodoro')
  const [showConfig, setShowConfig] = useState(false)

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces)

  const tasks = useTaskStore((s) => s.tasks)
  const fetchTasks = useTaskStore((s) => s.fetchTasks)

  const activeSession = useStudyStore((s) => s.activeSession)
  const timer = useStudyStore((s) => s.timer)
  const pauseSession = useStudyStore((s) => s.pauseSession)
  const resumeSession = useStudyStore((s) => s.resumeSession)
  const stopSession = useStudyStore((s) => s.stopSession)
  const advanceBlock = useStudyStore((s) => s.advanceBlock)
  const dismissCompletion = useStudyStore((s) => s.dismissCompletion)
  const restoreSession = useStudyStore((s) => s.restoreSession)

  const activeWorkspaceId = activeWorkspace?.id ?? null

  // Start the 1-second interval while timer is running
  useStudyTimer()

  useEffect(() => {
    void fetchWorkspaces()
  }, [fetchWorkspaces])

  useEffect(() => {
    if (activeWorkspaceId) {
      void fetchTasks(activeWorkspaceId)
      void restoreSession()
    }
  }, [activeWorkspaceId, fetchTasks, restoreSession])

  // Block advancement: when current block timer reaches 0
  useEffect(() => {
    if (timer.status !== 'running' || timer.secondsRemaining > 0 || !activeSession) return
    const isLastBlock = timer.currentBlockIndex >= activeSession.blocks.length - 1
    if (isLastBlock) {
      void stopSession(true)
    } else {
      advanceBlock()
    }
  }, [timer.status, timer.secondsRemaining, timer.currentBlockIndex, activeSession, advanceBlock, stopSession])

  if (!activeWorkspaceId) {
    return (
      <>
        <TopBar title="Study" />
        <PageContainer>
          <EmptyState
            icon={<BookOpen size={32} />}
            title="No workspace selected"
            description="Select or create a workspace to start studying."
          />
        </PageContainer>
      </>
    )
  }

  const hasActiveSession = activeSession !== null && (timer.status === 'running' || timer.status === 'paused')
  const isCompleted = timer.status === 'completed'
  const currentBlock = hasActiveSession
    ? activeSession.blocks[timer.currentBlockIndex]
    : null

  return (
    <>
      <TopBar title="Study" />

      <PageContainer>
        {/* ── Completed state ── */}
        {isCompleted && (
          <div className="flex flex-col items-center gap-6 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-success-muted)]">
              <BookOpen size={34} style={{ color: 'var(--color-success)' }} />
            </div>
            <div>
              <h2 className="text-[length:var(--text-widget-title)] font-semibold tracking-tight text-[var(--text-primary)]">
                Session complete
              </h2>
              <p className="mt-2 text-base text-[var(--text-tertiary)]">
                Great work. Ready for another?
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => { setShowConfig(true) }} className="btn-primary">
                Start New Session
              </button>
              <button onClick={dismissCompletion} className="btn-secondary">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ── Active session ── */}
        {hasActiveSession && currentBlock && (
          <div className="flex flex-col items-center gap-6 py-10">
            {/* Session meta */}
            <div className="text-center">
              <p className="label-eyebrow">
                {METHOD_LABELS[activeSession.method]}
                {activeSession.task_id && tasks.find(t => t.id === activeSession.task_id) && (
                  <span className="ml-2 normal-case">
                    · {tasks.find(t => t.id === activeSession.task_id)?.title}
                  </span>
                )}
              </p>
            </div>

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

        {/* ── Idle: method selector ── */}
        {!hasActiveSession && !isCompleted && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="mb-1 text-[length:var(--text-section)] font-semibold tracking-tight text-[var(--text-primary)]">
                Choose a study method
              </h2>
              <p className="text-base text-[var(--text-tertiary)]">
                Pick a structure that fits your session.
              </p>
            </div>

            <MethodSelector selected={selectedMethod} onSelect={setSelectedMethod} />

            <div>
              <button onClick={() => setShowConfig(true)} className="btn-primary">
                Configure &amp; Start
              </button>
            </div>
          </div>
        )}
      </PageContainer>

      {showConfig && activeWorkspaceId && (
        <SessionConfigModal
          method={selectedMethod}
          workspaceId={activeWorkspaceId}
          tasks={tasks}
          onClose={() => setShowConfig(false)}
        />
      )}
    </>
  )
}
