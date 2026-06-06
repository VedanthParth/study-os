import { create } from 'zustand'

// ── Theme ───────────────────────────────────────────────────────────────────
// Two themes only: Paper & Ink (light) and Library After Dark (dark).
// The chosen theme is applied to <html data-theme="…">, which drives every
// CSS variable in tokens.css. Persisted to localStorage so it survives reloads.

export type Theme = 'light' | 'dark'

const THEME_KEY = 'studyos_theme'

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(THEME_KEY)
  return stored === 'dark' ? 'dark' : 'light'
}

/**
 * Apply the theme to the document root. Exported so it can be called once
 * before React hydrates (see main.tsx) to avoid a flash of the wrong theme.
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
}

interface SettingsState {
  theme: Theme
}

interface SettingsActions {
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useSettingsStore = create<SettingsState & SettingsActions>((set, get) => ({
  theme: readStoredTheme(),

  setTheme: (theme) => {
    window.localStorage.setItem(THEME_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },

  toggleTheme: () => {
    get().setTheme(get().theme === 'dark' ? 'light' : 'dark')
  },
}))
