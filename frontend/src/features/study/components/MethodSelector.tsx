import { Check } from 'lucide-react'

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
    <div className="flex flex-col gap-2.5">
      {METHODS.map((method) => {
        const isSelected = selected === method
        return (
          <button
            key={method}
            type="button"
            onClick={() => onSelect(method)}
            className={cn(
              'flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border px-5 py-4 text-left transition-colors',
              isSelected
                ? 'border-[var(--color-study)] bg-[var(--color-study-muted)]'
                : 'border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--surface-sunken)]',
            )}
          >
            <div className="min-w-0">
              <p
                className={cn(
                  'text-base font-medium',
                  isSelected ? 'text-[var(--color-study)]' : 'text-[var(--text-primary)]',
                )}
              >
                {METHOD_LABELS[method]}
              </p>
              <p className="mt-1 text-[var(--text-meta)] text-[var(--text-tertiary)]">
                {METHOD_DESCRIPTIONS[method]}
              </p>
            </div>
            {isSelected && <Check size={18} strokeWidth={2.25} className="flex-shrink-0 text-[var(--color-study)]" />}
          </button>
        )
      })}
    </div>
  )
}
