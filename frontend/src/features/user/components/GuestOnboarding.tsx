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
    <div className="flex h-screen flex-col items-center justify-center gap-12 bg-[var(--surface-page)] p-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="label-eyebrow">Welcome to</span>
        <h1 className="text-[length:var(--text-page-title)] font-semibold tracking-tight text-[var(--text-primary)]">
          StudyOS
        </h1>
        <p className="text-lg text-[var(--text-secondary)]">
          A calm workspace for focused study
        </p>
      </div>

      <div className="flex w-full max-w-[320px] flex-col items-center gap-4">
        <button onClick={handleContinue} disabled={busy} className="btn-primary w-full">
          {busy ? 'Setting up…' : 'Continue as Guest'}
        </button>

        <p className="text-center text-[var(--text-meta)] leading-relaxed text-[var(--text-tertiary)]">
          No account needed.
          <br />
          Sign up later to sync across devices.
        </p>
      </div>
    </div>
  )
}
