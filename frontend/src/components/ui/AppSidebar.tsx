import {
  BarChart2,
  BookOpen,
  Calendar,
  Feather,
  LayoutDashboard,
  Map,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Settings,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

import { UserAvatar } from '@/components/ui/UserAvatar'
import { ROUTES } from '@/constants'
import { useUserStore } from '@/features/user/store'
import { WorkspaceManagementModal } from '@/features/workspace/components/WorkspaceManagementModal'
import { useWorkspaceStore } from '@/features/workspace/store'
import { WORKSPACE_TYPE_LABELS } from '@/features/workspace/types'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: ROUTES.HOME },
  { label: 'Calendar', icon: Calendar, to: ROUTES.CALENDAR },
  { label: 'Study', icon: BookOpen, to: ROUTES.STUDY },
  { label: 'Planner', icon: Map, to: ROUTES.PLANNER },
  { label: 'Analytics', icon: BarChart2, to: ROUTES.ANALYTICS },
] as const

const COLLAPSE_KEY = 'studyos_sidebar_collapsed'

const rowBase =
  'group relative flex items-center gap-3 rounded-[var(--radius-control)] px-3 text-[var(--text-md)] transition-colors'

function navRowClass(isActive: boolean, collapsed: boolean) {
  return cn(
    rowBase,
    'min-h-[44px]',
    collapsed && 'justify-center px-0',
    isActive
      ? 'bg-[var(--surface-sunken)] font-medium text-[var(--text-primary)]'
      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]',
  )
}

/** Left ink accent bar that marks the active row. */
function ActiveMark({ show }: { show: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-[var(--accent)] transition-opacity',
        show ? 'opacity-100' : 'opacity-0',
      )}
    />
  )
}

interface AppSidebarProps {
  className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
  const [manageOpen, setManageOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1')

  const currentUser = useUserStore((s) => s.currentUser)
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace)

  const userName = currentUser?.display_name ?? 'Guest User'
  const userPlan = currentUser?.is_guest === false ? (currentUser.email ?? 'StudyOS') : 'StudyOS Free'

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      return next
    })
  }

  return (
    <>
      <aside
        className={cn(
          'flex h-full flex-shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-card)] transition-[width] duration-200 ease-[var(--ease-soft)]',
          collapsed ? 'w-[76px]' : 'w-64',
          className,
        )}
      >
        {/* Logo lockup + collapse toggle */}
        <div
          className={cn(
            'flex h-20 flex-shrink-0 items-center border-b border-[var(--border-subtle)]',
            collapsed ? 'justify-center px-2' : 'gap-2.5 px-6',
          )}
        >
          {!collapsed && (
            <>
              <Feather size={22} strokeWidth={1.75} className="flex-shrink-0 text-[var(--color-deadline)]" />
              <span className="flex-1 truncate text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                StudyOS
              </span>
            </>
          )}
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
          >
            {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        <div className={cn('flex flex-1 flex-col gap-6 overflow-y-auto py-5', collapsed ? 'px-3' : 'px-4')}>
          {/* Primary navigation */}
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === ROUTES.HOME}
                title={collapsed ? label : undefined}
                className={({ isActive }) => navRowClass(isActive, collapsed)}
              >
                {({ isActive }) => (
                  <>
                    <ActiveMark show={isActive && !collapsed} />
                    <Icon size={19} strokeWidth={1.75} className="flex-shrink-0" />
                    {!collapsed && label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Workspaces — switch directly from the navigator */}
          <div className="flex flex-col gap-1.5">
            {!collapsed ? (
              <div className="flex items-center justify-between px-3 pb-2">
                <span className="label-eyebrow">Workspaces</span>
                <button
                  onClick={() => setManageOpen(true)}
                  aria-label="Manage workspaces"
                  title="Manage workspaces"
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setManageOpen(true)}
                aria-label="Manage workspaces"
                title="Manage workspaces"
                className={cn(rowBase, 'min-h-[40px] justify-center px-0 text-[var(--text-tertiary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]')}
              >
                <Plus size={18} />
              </button>
            )}

            {workspaces.length === 0 && !collapsed ? (
              <button
                onClick={() => setManageOpen(true)}
                className={cn(rowBase, 'min-h-[40px] text-[var(--text-tertiary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-secondary)]')}
              >
                <Plus size={18} />
                New workspace
              </button>
            ) : (
              workspaces.map((w) => {
                const isActive = activeWorkspace?.id === w.id
                return (
                  <button
                    key={w.id}
                    onClick={() => setActiveWorkspace(w)}
                    title={collapsed ? w.name : undefined}
                    className={cn(
                      rowBase,
                      collapsed ? 'min-h-[44px] justify-center px-0' : 'min-h-[52px] py-2 text-left',
                      isActive ? 'bg-[var(--surface-sunken)]' : 'hover:bg-[var(--surface-sunken)]',
                    )}
                  >
                    <ActiveMark show={isActive && !collapsed} />
                    <span
                      aria-hidden="true"
                      className={cn(
                        'h-2 w-2 flex-shrink-0 rounded-full',
                        isActive ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]',
                      )}
                    />
                    {!collapsed && (
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block truncate text-base font-medium',
                            isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]',
                          )}
                        >
                          {w.name}
                        </span>
                        <span className="block truncate text-[var(--text-meta)] text-[var(--text-tertiary)]">
                          {WORKSPACE_TYPE_LABELS[w.type]}
                        </span>
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Settings + user profile pinned at the bottom */}
        <div className={cn('flex flex-shrink-0 flex-col gap-2 border-t border-[var(--border-subtle)] py-3', collapsed ? 'px-3' : 'px-4')}>
          <NavLink
            to={ROUTES.SETTINGS}
            title={collapsed ? 'Settings' : undefined}
            className={({ isActive }) => navRowClass(isActive, collapsed)}
          >
            {({ isActive }) => (
              <>
                <ActiveMark show={isActive && !collapsed} />
                <Settings size={19} strokeWidth={1.75} className="flex-shrink-0" />
                {!collapsed && 'Settings'}
              </>
            )}
          </NavLink>

          <div
            className={cn(
              'flex items-center rounded-[var(--radius-control)]',
              collapsed ? 'justify-center px-0 py-1' : 'gap-3 px-3 py-2',
            )}
            title={collapsed ? userName : undefined}
          >
            <UserAvatar name={userName} size={36} />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[var(--text-base)] font-medium text-[var(--text-primary)]">
                  {userName}
                </p>
                <p className="truncate text-[var(--text-meta)] text-[var(--text-tertiary)]">{userPlan}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {manageOpen && <WorkspaceManagementModal onClose={() => setManageOpen(false)} />}
    </>
  )
}
