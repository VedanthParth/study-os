import { CheckSquare, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { useTaskStore } from '@/features/tasks/store'

import { usePlannerStore } from '../store'
import type { PlanItem, StudyPlan } from '../types'
import { PlanItemCard } from './PlanItemCard'
import { PlanItemForm } from './PlanItemForm'

interface PlanViewerProps {
  plan: StudyPlan
  onEditPlan: () => void
}

export function PlanViewer({ plan, onEditPlan }: PlanViewerProps) {
  const [editingItem, setEditingItem] = useState<PlanItem | null>(null)
  const [showAddItem, setShowAddItem] = useState(false)

  const tasks = useTaskStore((s) => s.tasks)
  const updateItem = usePlannerStore((s) => s.updateItem)
  const deleteItem = usePlannerStore((s) => s.deleteItem)
  const addItem = usePlannerStore((s) => s.addItem)

  function getTaskTitle(taskId: string | null): string | undefined {
    if (!taskId) return undefined
    return tasks.find((t) => t.id === taskId)?.title
  }

  async function handleToggleComplete(id: string, completed: boolean) {
    await updateItem(id, { completed })
  }

  const completedCount = plan.items.filter((i) => i.completed).length

  return (
    <div className="flex flex-col gap-4">
      {/* Plan header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-[length:var(--text-widget-title)] font-semibold tracking-tight text-[var(--text-primary)]">
            {plan.title}
          </h2>
          {plan.description && (
            <p className="mt-1 text-base text-[var(--text-tertiary)]">{plan.description}</p>
          )}
          <p className="mt-1.5 text-[var(--text-meta)] text-[var(--text-tertiary)]">
            {completedCount} / {plan.items.length} completed
          </p>
        </div>
        <button onClick={onEditPlan} className="btn-secondary btn-sm flex-shrink-0">
          <Pencil size={15} />
          Edit
        </button>
      </div>

      {/* Item list */}
      {plan.items.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={24} />}
          title="No items yet"
          description="Add plan items below."
          className="py-8"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {plan.items.map((item) =>
            editingItem?.id === item.id ? (
              <PlanItemForm
                key={item.id}
                item={item}
                planId={plan.id}
                tasks={tasks}
                onSave={async (payload) => {
                  await updateItem(item.id, payload)
                  setEditingItem(null)
                }}
                onCancel={() => setEditingItem(null)}
              />
            ) : (
              <PlanItemCard
                key={item.id}
                item={item}
                taskTitle={getTaskTitle(item.task_id)}
                onToggleComplete={handleToggleComplete}
                onEdit={setEditingItem}
                onDelete={deleteItem}
              />
            ),
          )}
        </div>
      )}

      {/* Add item */}
      {showAddItem ? (
        <PlanItemForm
          planId={plan.id}
          tasks={tasks}
          onSave={async (payload) => {
            await addItem(plan.id, {
              title: payload.title ?? '',
              recommendation_reason: payload.recommendation_reason ?? undefined,
              scheduled_date: payload.scheduled_date ?? new Date().toISOString().slice(0, 10),
              task_id: payload.task_id,
              order_index: plan.items.length,
            })
            setShowAddItem(false)
          }}
          onCancel={() => setShowAddItem(false)}
        />
      ) : (
        <button
          onClick={() => setShowAddItem(true)}
          className="flex items-center gap-1.5 self-start rounded-md border border-dashed border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-tertiary)] transition-colors hover:border-[var(--border-default)] hover:text-[var(--text-secondary)]"
        >
          <Plus size={12} />
          Add item
        </button>
      )}
    </div>
  )
}
