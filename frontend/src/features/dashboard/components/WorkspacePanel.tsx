import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants'
import { WorkspaceSelector } from '@/features/workspace/components/WorkspaceSelector'
import { useWorkspaceStore } from '@/features/workspace/store'
import { WORKSPACE_TYPE_LABELS } from '@/features/workspace/types'

export function WorkspacePanel() {
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)

  return (
    <div className="flex items-center gap-3">
      <WorkspaceSelector />
      {activeWorkspace && (
        <span className="hidden text-xs text-[var(--text-tertiary)] sm:block">
          {WORKSPACE_TYPE_LABELS[activeWorkspace.type]}
        </span>
      )}
      <Link
        to={ROUTES.WORKSPACE}
        className="text-xs text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)]"
      >
        Manage
      </Link>
    </div>
  )
}
