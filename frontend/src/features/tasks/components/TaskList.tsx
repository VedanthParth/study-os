import { useState } from 'react'

import { cn } from '@/lib/utils'

import { useTaskStore } from '../store'
import type { Task } from '../types'
import { TaskCard } from './TaskCard'

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onStartStudy?: (task: Task) => void
  onOpenEvent?: (task: Task) => void
  /** Set of task ids that have a linked calendar event. */
  linkedEventTaskIds?: Set<string>
}

export function TaskList({ tasks, onEdit, onStartStudy, onOpenEvent, linkedEventTaskIds }: TaskListProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const reorderTasks = useTaskStore((s) => s.reorderTasks)

  function handleDragStart(taskId: string) {
    setDraggedId(taskId)
  }

  function handleDragOver(e: React.DragEvent, taskId: string) {
    e.preventDefault()
    if (taskId !== draggedId) setDragOverId(taskId)
  }

  function handleDrop(e: React.DragEvent, dropId: string) {
    e.preventDefault()
    if (!draggedId || draggedId === dropId) {
      setDraggedId(null)
      setDragOverId(null)
      return
    }

    const oldIndex = tasks.findIndex((t) => t.id === draggedId)
    const newIndex = tasks.findIndex((t) => t.id === dropId)

    if (oldIndex === -1 || newIndex === -1) {
      setDraggedId(null)
      setDragOverId(null)
      return
    }

    const reordered = [...tasks]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    void reorderTasks({ items: reordered.map((t, i) => ({ id: t.id, position: i })) })

    setDraggedId(null)
    setDragOverId(null)
  }

  function handleDragEnd() {
    setDraggedId(null)
    setDragOverId(null)
  }

  return (
    <div className="flex flex-col gap-1">
      {tasks.map((task) => (
        <div
          key={task.id}
          draggable
          onDragStart={() => handleDragStart(task.id)}
          onDragOver={(e) => handleDragOver(e, task.id)}
          onDrop={(e) => handleDrop(e, task.id)}
          onDragEnd={handleDragEnd}
          className={cn(
            'rounded-lg transition-opacity',
            draggedId === task.id && 'opacity-50',
            dragOverId === task.id && draggedId !== task.id && 'ring-1 ring-[var(--border-default)]',
          )}
        >
          <TaskCard
            task={task}
            onEdit={onEdit}
            onStartStudy={onStartStudy}
            onOpenEvent={onOpenEvent}
            hasLinkedEvent={linkedEventTaskIds?.has(task.id) ?? false}
            isDragging={draggedId === task.id}
          />
        </div>
      ))}
    </div>
  )
}
