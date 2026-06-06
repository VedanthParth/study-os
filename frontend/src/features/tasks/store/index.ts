import { create } from 'zustand'

import { useAnalyticsStore } from '@/features/analytics/store'

import { taskApi } from '../api'
import type { CreateTaskPayload, ReorderTasksPayload, Task, UpdateTaskPayload } from '../types'

interface TaskState {
  tasks: Task[]
  loading: boolean
}

interface TaskActions {
  fetchTasks: (workspaceId: string) => Promise<void>
  createTask: (payload: CreateTaskPayload) => Promise<Task>
  updateTask: (id: string, payload: UpdateTaskPayload) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
  reorderTasks: (payload: ReorderTasksPayload) => Promise<void>
  clearTasks: () => void
}

export const useTaskStore = create<TaskState & TaskActions>((set) => ({
  tasks: [],
  loading: false,

  fetchTasks: async (workspaceId) => {
    set({ loading: true })
    try {
      const tasks = await taskApi.getTasks(workspaceId)
      set({ tasks, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  createTask: async (payload) => {
    const task = await taskApi.createTask(payload)
    set((state) => ({ tasks: [...state.tasks, task] }))
    void useAnalyticsStore.getState().refresh()
    return task
  },

  updateTask: async (id, payload) => {
    const updated = await taskApi.updateTask(id, payload)
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }))
    // due_date / completion changes feed Analytics & Upcoming Deadlines.
    void useAnalyticsStore.getState().refresh()
    return updated
  },

  deleteTask: async (id) => {
    await taskApi.deleteTask(id)
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
    void useAnalyticsStore.getState().refresh()
  },

  reorderTasks: async (payload) => {
    set((state) => {
      const positionMap = new Map(payload.items.map((i) => [i.id, i.position]))
      const updated = state.tasks.map((t) =>
        positionMap.has(t.id) ? { ...t, position: positionMap.get(t.id)! } : t,
      )
      return { tasks: updated.sort((a, b) => a.position - b.position) }
    })
    await taskApi.reorderTasks(payload)
  },

  clearTasks: () => set({ tasks: [] }),
}))
