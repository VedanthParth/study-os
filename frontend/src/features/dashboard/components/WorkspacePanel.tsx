import { Settings2 } from 'lucide-react'

import { WorkspaceSelector } from '@/features/workspace/components/WorkspaceSelector'
import { useWorkspaceStore } from '@/features/workspace/store'
import { WORKSPACE_TYPE_LABELS } from '@/features/workspace/types'

interface WorkspacePanelProps {
  /** Opens the workspace management modal (create / rename / delete / switch). */
  onManage: () => void
}

export function WorkspacePanel({ onManage }: WorkspacePanelProps) {
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)

  return (
    <div className="flex min-w-0 items-center gap-3">
      <WorkspaceSelector onManage={onManage} />
      {activeWorkspace && (
        <span className="label-eyebrow hidden sm:block">
          {WORKSPACE_TYPE_LABELS[activeWorkspace.type]}
        </span>
      )}
      <button
        onClick={onManage}
        className="flex items-center gap-1.5 text-[var(--text-meta)] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)]"
      >
        <Settings2 size={15} />
        Manage
      </button>
    </div>
  )
}
