import { useState } from 'react'

import { useUserStore } from '../store'

export function GuestOnboarding() {
  const [busy, setBusy] = useState(false)
  const createGuestUser = useUserStore((s) => s.createGuestUser)

  async function handleContinue() {
    setBusy(true)
    await createGuestUser()
    // loading state in store will update, causing AppLayout to re-render
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-10 bg-[var(--surface-page)] p-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
          Welcome to
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
          StudyOS
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          A calm workspace for focused study
        </p>
      </div>

      <div className="flex w-full max-w-[280px] flex-col items-center gap-4">
        <button
          onClick={handleContinue}
          disabled={busy}
          className="w-full rounded-xl bg-[var(--gray-900)] px-6 py-3 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--gray-700)] disabled:opacity-50"
        >
          {busy ? 'Setting up…' : 'Continue as Guest'}
        </button>

        <p className="text-center text-[11px] leading-relaxed text-[var(--text-tertiary)]">
          No account needed.
          <br />
          Sign up later to sync across devices.
        </p>
      </div>
    </div>
  )
}
