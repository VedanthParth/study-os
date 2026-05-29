import { create } from 'zustand'

type StudyState = Record<string, never>

export const useStudyStore = create<StudyState>()(() => ({}))
