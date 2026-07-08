import { cn } from '@/utils/cn'

import type { SessionBlock } from '../types'

interface SessionProgressProps {
  blocks: SessionBlock[]
  currentBlockIndex: number
}

export function SessionProgress({ blocks, currentBlockIndex }: SessionProgressProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {blocks.map((block, i) => {
        const isDone = i < currentBlockIndex
        const isCurrent = i === currentBlockIndex
        const isStudy = block.block_type === 'study'

        return (
          <div
            key={block.id}
            title={`${block.block_type} — ${block.duration_minutes} min`}
            className={cn(
              'rounded-full transition-all',
              isStudy ? 'h-2 w-2' : 'h-1.5 w-1.5',
              isDone && 'bg-[var(--color-study)]',
              isCurrent && isStudy && 'bg-[var(--color-study)] ring-2 ring-[var(--color-study-muted)] ring-offset-1',
              isCurrent && !isStudy && 'bg-[var(--border-strong)] ring-2 ring-[var(--border-subtle)] ring-offset-1',
              !isDone && !isCurrent && 'bg-[var(--border-default)]',
            )}
          />
        )
      })}
    </div>
  )
}
