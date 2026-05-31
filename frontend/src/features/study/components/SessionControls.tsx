import { Pause, Play, Square } from 'lucide-react'

import type { TimerStatus } from '../types'

interface SessionControlsProps {
  status: TimerStatus
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

export function SessionControls({ status, onPause, onResume, onStop }: SessionControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {status === 'running' && (
        <button
          onClick={onPause}
          className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-default)] hover:text-[var(--text-primary)]"
        >
          <Pause size={14} />
          Pause
        </button>
      )}

      {status === 'paused' && (
        <button
          onClick={onResume}
          className="flex items-center gap-2 rounded-lg bg-[var(--gray-900)] px-5 py-2.5 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--gray-700)]"
        >
          <Play size={14} />
          Resume
        </button>
      )}

      <button
        onClick={onStop}
        className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-5 py-2.5 text-sm font-medium text-[var(--text-tertiary)] transition-colors hover:border-[var(--color-exam-muted)] hover:text-[var(--color-exam)]"
      >
        <Square size={14} />
        Stop
      </button>
    </div>
  )
}
