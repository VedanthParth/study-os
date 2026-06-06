import { create } from 'zustand'

import { useAnalyticsStore } from '@/features/analytics/store'

import { studyApi } from '../api'
import type {
  PersistedStudyState,
  SessionBlock,
  StartSessionPayload,
  StudySession,
  TimerSlice,
  TimerStatus,
} from '../types'
import { STUDY_TIMER_KEY } from '../types'

const IDLE_TIMER: TimerSlice = {
  status: 'idle',
  currentBlockIndex: 0,
  secondsRemaining: 0,
  elapsedSeconds: 0,
}

function persistTimer(session: StudySession, timer: TimerSlice) {
  if (timer.status === 'idle' || timer.status === 'completed') {
    localStorage.removeItem(STUDY_TIMER_KEY)
    return
  }
  const state: PersistedStudyState = {
    session,
    timer: {
      status: timer.status,
      currentBlockIndex: timer.currentBlockIndex,
      secondsRemaining: timer.secondsRemaining,
      elapsedSeconds: timer.elapsedSeconds,
    },
  }
  localStorage.setItem(STUDY_TIMER_KEY, JSON.stringify(state))
}

interface StudyState {
  activeSession: StudySession | null
  sessionHistory: StudySession[]
  timer: TimerSlice
  loading: boolean
}

interface StudyActions {
  startSession: (payload: StartSessionPayload) => Promise<void>
  pauseSession: () => Promise<void>
  resumeSession: () => Promise<void>
  stopSession: (completed?: boolean) => Promise<void>
  tick: () => void
  advanceBlock: () => void
  dismissCompletion: () => void
  restoreSession: () => Promise<void>
  loadHistory: (workspaceId: string) => Promise<void>
  clearStudy: () => void
}

export const useStudyStore = create<StudyState & StudyActions>((set, get) => ({
  activeSession: null,
  sessionHistory: [],
  timer: IDLE_TIMER,
  loading: false,

  startSession: async (payload) => {
    const session = await studyApi.startSession(payload)
    const firstBlock = session.blocks[0]
    const timer: TimerSlice = {
      status: 'running',
      currentBlockIndex: 0,
      secondsRemaining: firstBlock.duration_minutes * 60,
      elapsedSeconds: 0,
    }
    persistTimer(session, timer)
    set({ activeSession: session, timer })
  },

  pauseSession: async () => {
    const { activeSession, timer } = get()
    if (!activeSession || timer.status !== 'running') return
    const updated = await studyApi.pauseSession(activeSession.id, { actual_duration: timer.elapsedSeconds })
    const newTimer: TimerSlice = { ...timer, status: 'paused' }
    persistTimer(updated, newTimer)
    set({ activeSession: updated, timer: newTimer })
  },

  resumeSession: async () => {
    const { activeSession, timer } = get()
    if (!activeSession || timer.status !== 'paused') return
    await studyApi.resumeSession(activeSession.id)
    const newTimer: TimerSlice = { ...timer, status: 'running' }
    persistTimer(activeSession, newTimer)
    set({ timer: newTimer })
  },

  stopSession: async (completed = false) => {
    const { activeSession, timer } = get()
    if (!activeSession) return
    const updated = await studyApi.stopSession(activeSession.id, {
      actual_duration: timer.elapsedSeconds,
      completed,
    })
    const finalStatus: TimerStatus = completed ? 'completed' : 'idle'
    localStorage.removeItem(STUDY_TIMER_KEY)
    set((state) => ({
      activeSession: null,
      timer: { ...IDLE_TIMER, status: finalStatus },
      sessionHistory: [updated, ...state.sessionHistory],
    }))
    // A finished session feeds study-time / sessions / streak analytics.
    void useAnalyticsStore.getState().refresh()
  },

  tick: () => {
    const { timer } = get()
    if (timer.status !== 'running') return
    set({
      timer: {
        ...timer,
        secondsRemaining: timer.secondsRemaining - 1,
        elapsedSeconds: timer.elapsedSeconds + 1,
      },
    })
  },

  advanceBlock: () => {
    const { activeSession, timer } = get()
    if (!activeSession) return
    const nextIndex = timer.currentBlockIndex + 1
    if (nextIndex >= activeSession.blocks.length) return
    const nextBlock = activeSession.blocks[nextIndex] as SessionBlock
    const newTimer: TimerSlice = {
      ...timer,
      currentBlockIndex: nextIndex,
      secondsRemaining: nextBlock.duration_minutes * 60,
    }
    persistTimer(activeSession, newTimer)
    set({ timer: newTimer })
  },

  dismissCompletion: () => {
    set({ timer: IDLE_TIMER })
  },

  restoreSession: async () => {
    const stored = localStorage.getItem(STUDY_TIMER_KEY)
    if (!stored) return
    try {
      const state = JSON.parse(stored) as PersistedStudyState
      const sessions = await studyApi.listSessions(state.session.workspace_id)
      const live = sessions.find((s) => s.id === state.session.id && s.ended_at === null)
      if (!live) {
        localStorage.removeItem(STUDY_TIMER_KEY)
        return
      }
      set({
        activeSession: live,
        timer: {
          status: 'paused',
          currentBlockIndex: state.timer.currentBlockIndex,
          secondsRemaining: state.timer.secondsRemaining,
          elapsedSeconds: state.timer.elapsedSeconds,
        },
      })
    } catch {
      localStorage.removeItem(STUDY_TIMER_KEY)
    }
  },

  loadHistory: async (workspaceId) => {
    set({ loading: true })
    try {
      const sessions = await studyApi.listSessions(workspaceId)
      set({ sessionHistory: sessions, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  clearStudy: () => {
    localStorage.removeItem(STUDY_TIMER_KEY)
    set({ activeSession: null, sessionHistory: [], timer: IDLE_TIMER })
  },
}))
