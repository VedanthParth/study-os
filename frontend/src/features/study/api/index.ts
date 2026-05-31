import apiClient from '@/services/apiClient'

import type {
  PauseSessionPayload,
  StartSessionPayload,
  StopSessionPayload,
  StudySession,
} from '../types'

const BASE = '/api/study'

export const studyApi = {
  listSessions: (workspaceId: string): Promise<StudySession[]> =>
    apiClient.get<StudySession[]>(BASE, { params: { workspace_id: workspaceId } }).then((r) => r.data),

  startSession: (payload: StartSessionPayload): Promise<StudySession> =>
    apiClient.post<StudySession>(`${BASE}/start`, payload).then((r) => r.data),

  pauseSession: (id: string, payload: PauseSessionPayload): Promise<StudySession> =>
    apiClient.post<StudySession>(`${BASE}/pause/${id}`, payload).then((r) => r.data),

  resumeSession: (id: string): Promise<StudySession> =>
    apiClient.post<StudySession>(`${BASE}/resume/${id}`, {}).then((r) => r.data),

  stopSession: (id: string, payload: StopSessionPayload): Promise<StudySession> =>
    apiClient.post<StudySession>(`${BASE}/stop/${id}`, payload).then((r) => r.data),
}
