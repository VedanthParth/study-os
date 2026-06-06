import { Moon, Sun, Sunrise } from 'lucide-react'

import { useUserStore } from '@/features/user/store'

// Calm, encouraging lines — chosen by the day so the message is stable through a
// session but gently changes day to day. Tone: a study planner, not a hype app.
const SUBTITLES = [
  'Small steps today, big results tomorrow.',
  'Stay consistent. Your future self is watching.',
  'A calm mind learns best — one block at a time.',
  'Progress over perfection. Begin where you are.',
  'Quiet focus beats loud ambition.',
  'Show up for the next 25 minutes. That is enough.',
  'Every page you turn is momentum.',
]

function timeOfDay(): { greeting: string; Icon: typeof Sun } {
  const hour = new Date().getHours()
  if (hour < 12) return { greeting: 'Good morning', Icon: Sunrise }
  if (hour < 17) return { greeting: 'Good afternoon', Icon: Sun }
  return { greeting: 'Good evening', Icon: Moon }
}

function dayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000)
}

export function DashboardGreeting() {
  const currentUser = useUserStore((s) => s.currentUser)
  const { greeting, Icon } = timeOfDay()

  const firstName = currentUser?.display_name?.trim().split(/\s+/)[0] ?? 'there'
  const subtitle = SUBTITLES[dayOfYear() % SUBTITLES.length]

  return (
    <div className="min-w-0">
      <h1 className="flex items-center gap-2.5 text-[length:var(--text-page-title)] font-semibold tracking-tight text-[var(--text-primary)]">
        <span className="truncate">
          {greeting}, {firstName}
        </span>
        <Icon
          size={26}
          strokeWidth={1.75}
          className="flex-shrink-0 text-[var(--color-deadline)]"
          aria-hidden="true"
        />
      </h1>
      <p className="mt-1.5 text-base text-[var(--text-tertiary)]">{subtitle}</p>
    </div>
  )
}
