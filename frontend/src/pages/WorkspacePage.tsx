import { LayoutDashboard, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { PageContainer } from '@/components/ui/PageContainer'
import { TopBar } from '@/components/ui/TopBar'
import { CreateWorkspaceModal } from '@/features/workspace/components/CreateWorkspaceModal'
import { WorkspaceCard } from '@/features/workspace/components/WorkspaceCard'
import { useWorkspaceStore } from '@/features/workspace/store'

export function WorkspacePage() {
  const [showCreate, setShowCreate] = useState(false)

  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const loading = useWorkspaceStore((s) => s.loading)
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces)
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace)
  const updateWorkspace = useWorkspaceStore((s) => s.updateWorkspace)
  const deleteWorkspace = useWorkspaceStore((s) => s.deleteWorkspace)

  useEffect(() => {
    void fetchWorkspaces()
  }, [fetchWorkspaces])

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
        {loading && workspaces.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-[var(--text-tertiary)]">Loading…</p>
          </div>
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
        )}
      </PageContainer>

      {showCreate && <CreateWorkspaceModal onClose={() => setShowCreate(false)} />}
    </>
  )
}
