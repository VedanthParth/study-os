import { create } from 'zustand'

type SettingsState = Record<string, never>

export const useSettingsStore = create<SettingsState>()(() => ({}))
