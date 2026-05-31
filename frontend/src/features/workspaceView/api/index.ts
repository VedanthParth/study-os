import apiClient from '@/services/apiClient'

import type { UpdateWorkspaceViewPayload, WorkspaceView } from '../types'

const BASE = '/api/workspace-views'

export const workspaceViewApi = {
  getView: (workspaceId: string): Promise<WorkspaceView> =>
    apiClient.get<WorkspaceView>(`${BASE}/${workspaceId}`).then((r) => r.data),

  upsertView: (workspaceId: string, payload: UpdateWorkspaceViewPayload): Promise<WorkspaceView> =>
    apiClient.put<WorkspaceView>(`${BASE}/${workspaceId}`, payload).then((r) => r.data),
}
