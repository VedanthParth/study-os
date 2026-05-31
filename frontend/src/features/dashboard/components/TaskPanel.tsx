import { CheckSquare } from 'lucide-react'
import { useState } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { TaskEditor } from '@/features/tasks/components/TaskEditor'
import { TaskInput } from '@/features/tasks/components/TaskInput'
import { TaskList } from '@/features/tasks/components/TaskList'
import { useTaskStore } from '@/features/tasks/store'
import type { Task } from '@/features/tasks/types'
import { useWorkspaceStore } from '@/features/workspace/store'

import { DashboardPanel } from './DashboardPanel'

/**
 * Dashboard panel wrapping task management for the active workspace.
 * Reads from the task store — data fetching is handled by DashboardPage.
 */
export function TaskPanel() {
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const tasks = useTaskStore((s) => s.tasks)
  const loading = useTaskStore((s) => s.loading)

  if (!activeWorkspace) return null

  return (
    <>
      <DashboardPanel title="Tasks" icon={<CheckSquare size={13} />}>
        <div className="flex flex-col gap-3 p-3">
          <TaskInput workspaceId={activeWorkspace.id} />

          {loading ? (
            <LoadingState label="Loading tasks…" />
          ) : tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Add your first task above."
              className="py-8 text-xs"
            />
          ) : (
            <TaskList tasks={tasks} onEdit={setEditingTask} />
          )}
        </div>
      </DashboardPanel>

      {editingTask && (
        <TaskEditor task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </>
  )
}
