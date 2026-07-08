import { cn } from '@/utils/cn'

import type { SessionBlock, TimerStatus } from '../types'
import { BLOCK_TYPE_LABELS } from '../types'

const RADIUS = 88
const STROKE = 9
const SIZE = 210
const CENTER = SIZE / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

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
  const isPaused = status === 'paused'
  const gradId = isStudy ? 'timer-arc-study' : 'timer-arc-break'

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="timer-arc-study" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-study)" />
              <stop offset="100%" stopColor="color-mix(in srgb, var(--color-study) 45%, var(--surface-card))" />
            </linearGradient>
            <linearGradient id="timer-arc-break" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-success)" />
              <stop offset="100%" stopColor="color-mix(in srgb, var(--color-success) 45%, var(--surface-card))" />
            </linearGradient>
          </defs>

          {/* Track — a soft sunken groove */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            style={{ stroke: 'var(--surface-sunken)', strokeWidth: STROKE }}
          />

          {/* Progress arc — gradient, rounded, with a gentle lift */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            style={{
              stroke: `url(#${gradId})`,
              strokeWidth: STROKE,
              strokeDasharray: CIRCUMFERENCE,
              strokeDashoffset: offset,
              strokeLinecap: 'round',
              transition: 'stroke-dashoffset 0.8s linear',
              opacity: isPaused ? 0.4 : 1,
              filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.10))',
            }}
          />
        </svg>

        {/* Center readout */}
        <div className="absolute flex flex-col items-center gap-2.5">
          <span
            className="font-light tabular-nums text-[var(--text-primary)]"
            style={{ fontSize: '3.25rem', lineHeight: 1, letterSpacing: '-0.03em' }}
          >
            {formatTime(secondsRemaining)}
          </span>
          <span
            className={cn(
              'label-eyebrow rounded-[var(--radius-chip)] px-2.5 py-1',
              isPaused
                ? 'bg-[var(--surface-sunken)] text-[var(--text-tertiary)]'
                : isStudy
                  ? 'bg-[var(--color-study-muted)] text-[var(--color-study)]'
                  : 'bg-[var(--color-success-muted)] text-[var(--color-success)]',
            )}
          >
            {isPaused ? 'Paused' : BLOCK_TYPE_LABELS[block.block_type]}
          </span>
        </div>
      </div>
    </div>
  )
}
