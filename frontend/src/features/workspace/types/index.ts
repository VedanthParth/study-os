export type WorkspaceType = 'semester' | 'competitive' | 'research' | 'self-learning'

export interface Workspace {
  id: string
  name: string
  type: WorkspaceType
  created_at: string
  updated_at: string
}

export interface CreateWorkspacePayload {
  name: string
  type: WorkspaceType
}

export interface UpdateWorkspacePayload {
  name?: string
  type?: WorkspaceType
}

export const WORKSPACE_TYPE_LABELS: Record<WorkspaceType, string> = {
  semester: 'Semester',
  competitive: 'Competitive Exam',
  research: 'Research',
  'self-learning': 'Self-Learning',
}

export const WORKSPACE_TYPE_DESCRIPTIONS: Record<WorkspaceType, string> = {
  semester: 'Organise courses and subjects for a semester',
  competitive: 'Prepare for competitive or entrance exams',
  research: 'Track a self-directed research topic',
  'self-learning': 'Learn something new at your own pace',
}
