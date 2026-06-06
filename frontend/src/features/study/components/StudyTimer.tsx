import type { SessionBlock, TimerStatus } from '../types'
import { BLOCK_TYPE_LABELS } from '../types'

const RADIUS = 80
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const SIZE = (RADIUS + 12) * 2  // 184

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds)
  const mins = Math.floor(s / 60)
  const secs = s % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

interface StudyTimerProps {
  block: SessionBlock
  secondsRemaining: number
  totalBlockSeconds: number
  status: TimerStatus
}

export function StudyTimer({ block, secondsRemaining, totalBlockSeconds, status }: StudyTimerProps) {
  const progress = totalBlockSeconds > 0 ? secondsRemaining / totalBlockSeconds : 1
  const offset = CIRCUMFERENCE * (1 - progress)
  const isStudy = block.block_type === 'study'
  const arcColor = isStudy ? 'var(--color-study)' : 'var(--border-default)'
  const isPaused = status === 'paused'

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            style={{ stroke: 'var(--border-subtle)', strokeWidth: 6 }}
          />
          {/* Progress arc */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            style={{
              stroke: arcColor,
              strokeWidth: 6,
              strokeDasharray: CIRCUMFERENCE,
              strokeDashoffset: offset,
              strokeLinecap: 'round',
              transition: 'stroke-dashoffset 0.8s linear',
              opacity: isPaused ? 0.5 : 1,
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute flex flex-col items-center gap-1">
          <span
            className="font-light tabular-nums text-[var(--text-primary)]"
            style={{ fontSize: '2.5rem', lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            {formatTime(secondsRemaining)}
          </span>
          <span className="label-eyebrow">
            {isPaused ? 'Paused' : BLOCK_TYPE_LABELS[block.block_type]}
          </span>
        </div>
      </div>
    </div>
  )
}
