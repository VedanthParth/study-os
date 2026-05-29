import apiClient from '@/services/apiClient'

import type {
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  Workspace,
} from '../types'

const BASE = '/api/workspaces'

export const workspaceApi = {
  getWorkspaces: (): Promise<Workspace[]> =>
    apiClient.get<Workspace[]>(BASE).then((r) => r.data),

  createWorkspace: (payload: CreateWorkspacePayload): Promise<Workspace> =>
    apiClient.post<Workspace>(BASE, payload).then((r) => r.data),

  updateWorkspace: (id: string, payload: UpdateWorkspacePayload): Promise<Workspace> =>
    apiClient.patch<Workspace>(`${BASE}/${id}`, payload).then((r) => r.data),

  deleteWorkspace: (id: string): Promise<void> =>
    apiClient.delete(`${BASE}/${id}`).then(() => undefined),
}
