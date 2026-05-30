import apiClient from '@/services/apiClient'

import type { CreateTaskPayload, ReorderTasksPayload, Task, UpdateTaskPayload } from '../types'

const BASE = '/api/tasks'

export const taskApi = {
  getTasks: (workspaceId: string): Promise<Task[]> =>
    apiClient.get<Task[]>(BASE, { params: { workspace_id: workspaceId } }).then((r) => r.data),

  createTask: (payload: CreateTaskPayload): Promise<Task> =>
    apiClient.post<Task>(BASE, payload).then((r) => r.data),

  updateTask: (id: string, payload: UpdateTaskPayload): Promise<Task> =>
    apiClient.patch<Task>(`${BASE}/${id}`, payload).then((r) => r.data),

  deleteTask: (id: string): Promise<void> =>
    apiClient.delete(`${BASE}/${id}`).then(() => undefined),

  reorderTasks: (payload: ReorderTasksPayload): Promise<void> =>
    apiClient.post(`${BASE}/reorder`, payload).then(() => undefined),
}
