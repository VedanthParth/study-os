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
        <button onClick={onPause} className="btn-secondary">
          <Pause size={17} />
          Pause
        </button>
      )}

      {status === 'paused' && (
        <button onClick={onResume} className="btn-primary">
          <Play size={17} />
          Resume
        </button>
      )}

      <button
        onClick={onStop}
        className="btn-secondary text-[var(--text-tertiary)] hover:border-[var(--color-exam)] hover:text-[var(--color-exam)]"
      >
        <Square size={17} />
        Stop
      </button>
    </div>
  )
}
