import { Map } from 'lucide-react'
import { useEffect, useState } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageContainer } from '@/components/ui/PageContainer'
import { TopBar } from '@/components/ui/TopBar'
import { PlanCard } from '@/features/planner/components/PlanCard'
import { PlanEditor } from '@/features/planner/components/PlanEditor'
import { PlanViewer } from '@/features/planner/components/PlanViewer'
import { usePlannerStore } from '@/features/planner/store'
import type { StudyPlan } from '@/features/planner/types'
import { useTaskStore } from '@/features/tasks/store'
import { useWorkspaceStore } from '@/features/workspace/store'

type Mode = 'view' | 'edit' | 'create'

export function PlannerPage() {
  const [mode, setMode] = useState<Mode>('view')

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces)

  const tasks = useTaskStore((s) => s.tasks)
  const fetchTasks = useTaskStore((s) => s.fetchTasks)

  const plans = usePlannerStore((s) => s.plans)
  const activePlan = usePlannerStore((s) => s.activePlan)
  const loading = usePlannerStore((s) => s.loading)
  const fetchPlans = usePlannerStore((s) => s.fetchPlans)
  const deletePlan = usePlannerStore((s) => s.deletePlan)
  const setActivePlan = usePlannerStore((s) => s.setActivePlan)
  const clearPlanner = usePlannerStore((s) => s.clearPlanner)

  const activeWorkspaceId = activeWorkspace?.id ?? null

  useEffect(() => {
    void fetchWorkspaces()
  }, [fetchWorkspaces])

  useEffect(() => {
    if (activeWorkspaceId) {
      void fetchPlans(activeWorkspaceId)
      void fetchTasks(activeWorkspaceId)
    } else {
      clearPlanner()
    }
  }, [activeWorkspaceId, fetchPlans, fetchTasks, clearPlanner])

  function handleSelectPlan(plan: StudyPlan) {
    setActivePlan(plan)
    setMode('view')
  }

  async function handleDeletePlan(id: string) {
    await deletePlan(id)
    if (activePlan?.id === id) setMode('view')
  }

  function handleSaved(plan: StudyPlan) {
    setActivePlan(plan)
    setMode('view')
  }

  return (
    <>
      <TopBar
        title="Planner"
        actions={
          activeWorkspaceId ? (
            <button
              onClick={() => { setActivePlan(null); setMode('create') }}
              className="btn-primary btn-sm"
            >
              New Plan
            </button>
          ) : undefined
        }
      />

      <PageContainer>
        {!activeWorkspaceId ? (
          <EmptyState
            icon={<Map size={32} />}
            title="No workspace selected"
            description="Select a workspace to manage study plans."
          />
        ) : loading && plans.length === 0 ? (
          <LoadingState label="Loading plans…" />
        ) : (
          <div className="flex h-full gap-6">
            {/* Left: plan list */}
            <div className="flex w-72 flex-shrink-0 flex-col gap-2">
              <p className="label-eyebrow mb-1">Plans ({plans.length})</p>
              {plans.length === 0 ? (
                <p className="text-base text-[var(--text-tertiary)]">No plans yet. Create your first plan.</p>
              ) : (
                plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isActive={activePlan?.id === plan.id && mode !== 'create'}
                    onSelect={handleSelectPlan}
                    onDelete={handleDeletePlan}
                  />
                ))
              )}
            </div>

            {/* Right: plan content */}
            <div className="flex-1 overflow-y-auto">
              {mode === 'create' ? (
                <PlanEditor
                  workspaceId={activeWorkspaceId}
                  tasks={tasks}
                  onSave={handleSaved}
                  onCancel={() => setMode('view')}
                />
              ) : mode === 'edit' && activePlan ? (
                <PlanEditor
                  plan={activePlan}
                  workspaceId={activeWorkspaceId}
                  tasks={tasks}
                  onSave={handleSaved}
                  onCancel={() => setMode('view')}
                />
              ) : activePlan ? (
                <PlanViewer
                  plan={activePlan}
                  onEditPlan={() => setMode('edit')}
                />
              ) : (
                <EmptyState
                  icon={<Map size={24} />}
                  title="Select a plan"
                  description="Choose a plan from the list or create a new one."
                />
              )}
            </div>
          </div>
        )}
      </PageContainer>
    </>
  )
}
