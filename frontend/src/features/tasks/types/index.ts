export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  workspace_id: string
  title: string
  description: string | null
  completed: boolean
  priority: TaskPriority
  due_date: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface CreateTaskPayload {
  workspace_id: string
  title: string
  description?: string
  priority?: TaskPriority
  due_date?: string
}

export interface UpdateTaskPayload {
  title?: string
  description?: string | null
  completed?: boolean
  priority?: TaskPriority
  due_date?: string | null
}

export interface ReorderTasksPayload {
  items: Array<{ id: string; position: number }>
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}
