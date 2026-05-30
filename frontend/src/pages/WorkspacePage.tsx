import { CheckSquare, LayoutDashboard, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageContainer } from '@/components/ui/PageContainer'
import { SectionCard } from '@/components/ui/SectionCard'
import { TopBar } from '@/components/ui/TopBar'
import { TaskEditor } from '@/features/tasks/components/TaskEditor'
import { TaskInput } from '@/features/tasks/components/TaskInput'
import { TaskList } from '@/features/tasks/components/TaskList'
import { useTaskStore } from '@/features/tasks/store'
import type { Task } from '@/features/tasks/types'
import { CreateWorkspaceModal } from '@/features/workspace/components/CreateWorkspaceModal'
import { WorkspaceCard } from '@/features/workspace/components/WorkspaceCard'
import { useWorkspaceStore } from '@/features/workspace/store'

export function WorkspacePage() {
  const [showCreate, setShowCreate] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const wsLoading = useWorkspaceStore((s) => s.loading)
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces)
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace)
  const updateWorkspace = useWorkspaceStore((s) => s.updateWorkspace)
  const deleteWorkspace = useWorkspaceStore((s) => s.deleteWorkspace)

  const tasks = useTaskStore((s) => s.tasks)
  const taskLoading = useTaskStore((s) => s.loading)
  const fetchTasks = useTaskStore((s) => s.fetchTasks)
  const clearTasks = useTaskStore((s) => s.clearTasks)

  const activeWorkspaceId = activeWorkspace?.id ?? null

  useEffect(() => {
    void fetchWorkspaces()
  }, [fetchWorkspaces])

  useEffect(() => {
    if (activeWorkspaceId) {
      void fetchTasks(activeWorkspaceId)
    } else {
      clearTasks()
    }
  }, [activeWorkspaceId, fetchTasks, clearTasks])

  async function handleRename(id: string, name: string) {
    await updateWorkspace(id, { name })
  }

  return (
    <>
      <TopBar
        title="Workspace"
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-md bg-[var(--gray-900)] px-3 py-1.5 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--gray-700)]"
          >
            <Plus size={14} />
            New Workspace
          </button>
        }
      />

      <PageContainer>
        {wsLoading && workspaces.length === 0 ? (
          <LoadingState />
        ) : workspaces.length === 0 ? (
          <EmptyState
            icon={<LayoutDashboard size={32} />}
            title="No workspaces yet"
            description="Create your first workspace to get started."
            action={
              <button
                onClick={() => setShowCreate(true)}
                className="rounded-md bg-[var(--gray-900)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--gray-700)]"
              >
                New Workspace
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-8">
            {/* Tasks — primary content for active workspace */}
            {activeWorkspace && (
              <section className="flex flex-col gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  {activeWorkspace.name}
                </h2>
                <TaskInput workspaceId={activeWorkspace.id} />
                {taskLoading ? (
                  <LoadingState label="Loading tasks…" />
                ) : tasks.length === 0 ? (
                  <EmptyState
                    icon={<CheckSquare size={24} />}
                    title="No tasks yet"
                    description="Add your first task above."
                  />
                ) : (
                  <TaskList tasks={tasks} onEdit={setEditingTask} />
                )}
              </section>
            )}

            {/* Workspace management */}
            <SectionCard title="Workspaces">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {workspaces.map((workspace) => (
                  <WorkspaceCard
                    key={workspace.id}
                    workspace={workspace}
                    isActive={activeWorkspace?.id === workspace.id}
                    onActivate={setActiveWorkspace}
                    onRename={handleRename}
                    onDelete={deleteWorkspace}
                  />
                ))}
              </div>
            </SectionCard>
          </div>
        )}
      </PageContainer>

      {showCreate && <CreateWorkspaceModal onClose={() => setShowCreate(false)} />}
      {editingTask && (
        <TaskEditor task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </>
  )
}
