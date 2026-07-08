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
import { useStudySession } from '@/features/study/hooks/useStudySession'
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

  const restoreSession = useStudyStore((s) => s.restoreSession)

  // Shared session orchestration (tick + block advancement + derived state).
  const { activeSession, timer, hasActiveSession, isCompleted, currentBlock, pause, resume, stop, dismissCompletion } =
    useStudySession()

  const activeWorkspaceId = activeWorkspace?.id ?? null

  useEffect(() => {
    void fetchWorkspaces()
  }, [fetchWorkspaces])

  useEffect(() => {
    if (activeWorkspaceId) {
      void fetchTasks(activeWorkspaceId)
      void restoreSession()
    }
  }, [activeWorkspaceId, fetchTasks, restoreSession])

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

  const linkedTask = activeSession?.task_id ? tasks.find((t) => t.id === activeSession.task_id) : undefined

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
              <button onClick={() => setShowConfig(true)} className="btn-primary">
                Start New Session
              </button>
              <button onClick={dismissCompletion} className="btn-secondary">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ── Active session ── */}
        {activeSession && currentBlock && (
          <div className="flex flex-col items-center gap-6 py-10">
            {/* Session meta */}
            <div className="text-center">
              <p className="label-eyebrow">
                {METHOD_LABELS[activeSession.method]}
                {linkedTask && <span className="ml-2 normal-case">· {linkedTask.title}</span>}
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
              onPause={pause}
              onResume={resume}
              onStop={() => stop(false)}
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
