import { Moon, Sun } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/store/settingsStore'

interface ThemeToggleProps {
  className?: string
}

/**
 * Light / dark theme switch. Flips <html data-theme> via the settings store,
 * which re-tints every CSS variable in tokens.css. Sized for a 44px hit area.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const theme = useSettingsStore((s) => s.theme)
  const toggleTheme = useSettingsStore((s) => s.toggleTheme)
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Paper & Ink (light)' : 'Library After Dark (dark)'}
      className={cn(
        'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]',
        className,
      )}
    >
      {isDark ? <Sun size={19} strokeWidth={1.75} /> : <Moon size={19} strokeWidth={1.75} />}
    </button>
  )
}
