import { Check, Moon, Sun } from 'lucide-react'

import { PageContainer } from '@/components/ui/PageContainer'
import { SectionCard } from '@/components/ui/SectionCard'
import { TopBar } from '@/components/ui/TopBar'
import { cn } from '@/lib/utils'
import type { Theme } from '@/store/settingsStore'
import { useSettingsStore } from '@/store/settingsStore'

const THEME_OPTIONS: { value: Theme; label: string; description: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Paper & Ink', description: 'Warm ivory daylight — calm and readable.', icon: Sun },
  { value: 'dark', label: 'Library After Dark', description: 'Warm charcoal and parchment for night study.', icon: Moon },
]

export function SettingsPage() {
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)

  return (
    <>
      <TopBar title="Settings" />
      <PageContainer>
        <div className="flex max-w-3xl flex-col gap-[var(--section-gap)]">
          <SectionCard title="Appearance">
            <p className="mb-5 text-base text-[var(--text-secondary)]">
              Choose how StudyOS looks. Your choice is remembered on this device.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {THEME_OPTIONS.map(({ value, label, description, icon: Icon }) => {
                const selected = theme === value
                return (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                      'group relative flex flex-col gap-2 rounded-[var(--radius-panel)] border p-5 text-left transition-colors',
                      selected
                        ? 'border-[var(--border-strong)] bg-[var(--surface-sunken)]'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--surface-sunken)]',
                    )}
                  >
                    {selected && (
                      <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--button-primary-text)]">
                        <Check size={14} />
                      </span>
                    )}
                    <Icon size={24} strokeWidth={1.75} className="text-[var(--text-secondary)]" />
                    <span className="text-lg font-semibold text-[var(--text-primary)]">{label}</span>
                    <span className="text-[var(--text-meta)] text-[var(--text-tertiary)]">{description}</span>
                  </button>
                )
              })}
            </div>
          </SectionCard>
        </div>
      </PageContainer>
    </>
  )
}
