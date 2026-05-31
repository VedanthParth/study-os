export type StudyMethod = 'pomodoro' | 'deep-work' | 'revision' | 'recall' | 'custom'
export type BlockType = 'study' | 'short-break' | 'long-break'
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'

export interface SessionBlock {
  id: string
  session_id: string
  block_type: BlockType
  duration_minutes: number
  order_index: number
}

export interface StudySession {
  id: string
  workspace_id: string
  task_id: string | null
  method: StudyMethod
  planned_duration: number
  actual_duration: number
  started_at: string
  ended_at: string | null
  completed: boolean
  interrupted: boolean
  pause_count: number
  blocks: SessionBlock[]
  created_at: string
  updated_at: string
}

export interface SessionBlockConfig {
  block_type: BlockType
  duration_minutes: number
  order_index: number
}

export interface StartSessionPayload {
  workspace_id: string
  task_id?: string | null
  method: StudyMethod
  blocks: SessionBlockConfig[]
}

export interface PauseSessionPayload {
  actual_duration: number
}

export interface StopSessionPayload {
  actual_duration: number
  completed: boolean
}

export interface TimerSlice {
  status: TimerStatus
  currentBlockIndex: number
  secondsRemaining: number
  elapsedSeconds: number
}

export const METHOD_LABELS: Record<StudyMethod, string> = {
  pomodoro: 'Pomodoro',
  'deep-work': 'Deep Work',
  revision: 'Revision',
  recall: 'Active Recall',
  custom: 'Custom',
}

export const METHOD_DESCRIPTIONS: Record<StudyMethod, string> = {
  pomodoro: '4 × 25 min study + 5 min break',
  'deep-work': '90 min focused work + 15 min break',
  revision: '45 min review + 10 min break',
  recall: '4 × 30 min study + 5 min break',
  custom: 'Configure your own blocks',
}

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  study: 'Study',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
}

export const METHOD_PRESETS: Record<Exclude<StudyMethod, 'custom'>, SessionBlockConfig[]> = {
  pomodoro: [
    { block_type: 'study', duration_minutes: 25, order_index: 0 },
    { block_type: 'short-break', duration_minutes: 5, order_index: 1 },
    { block_type: 'study', duration_minutes: 25, order_index: 2 },
    { block_type: 'short-break', duration_minutes: 5, order_index: 3 },
  ],
  'deep-work': [
    { block_type: 'study', duration_minutes: 90, order_index: 0 },
    { block_type: 'short-break', duration_minutes: 15, order_index: 1 },
  ],
  revision: [
    { block_type: 'study', duration_minutes: 45, order_index: 0 },
    { block_type: 'short-break', duration_minutes: 10, order_index: 1 },
  ],
  recall: [
    { block_type: 'study', duration_minutes: 30, order_index: 0 },
    { block_type: 'short-break', duration_minutes: 5, order_index: 1 },
    { block_type: 'study', duration_minutes: 30, order_index: 2 },
    { block_type: 'short-break', duration_minutes: 5, order_index: 3 },
  ],
}

export const STUDY_TIMER_KEY = 'studyos_active_study_session'

export interface PersistedStudyState {
  session: StudySession
  timer: {
    status: 'running' | 'paused'
    currentBlockIndex: number
    secondsRemaining: number
    elapsedSeconds: number
  }
}
