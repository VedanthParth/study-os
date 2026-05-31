import { cn } from '@/lib/utils'

import type { StudyMethod } from '../types'
import { METHOD_DESCRIPTIONS, METHOD_LABELS } from '../types'

const METHODS: StudyMethod[] = ['pomodoro', 'deep-work', 'revision', 'recall', 'custom']

interface MethodSelectorProps {
  selected: StudyMethod
  onSelect: (method: StudyMethod) => void
}

export function MethodSelector({ selected, onSelect }: MethodSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {METHODS.map((method) => (
        <button
          key={method}
          type="button"
          onClick={() => onSelect(method)}
          className={cn(
            'rounded-lg border px-4 py-3 text-left transition-colors',
            selected === method
              ? 'border-[var(--gray-700)] bg-[var(--surface-sunken)]'
              : 'border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--surface-sunken)]',
          )}
        >
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {METHOD_LABELS[method]}
          </p>
          <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
            {METHOD_DESCRIPTIONS[method]}
          </p>
        </button>
      ))}
    </div>
  )
}
