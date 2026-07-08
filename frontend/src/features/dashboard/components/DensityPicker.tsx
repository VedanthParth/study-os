import type { WidgetDensity } from '@/features/workspaceView/types'
import { DENSITY_DEFINITIONS } from '@/features/workspaceView/types'
import { cn } from '@/utils/cn'

const DENSITIES: WidgetDensity[] = ['compact', 'balanced', 'expanded']

interface DensityPickerProps {
  current: WidgetDensity
  onChange: (density: WidgetDensity) => void
}

export function DensityPicker({ current, onChange }: DensityPickerProps) {
  return (
    <div className="flex flex-col gap-1 py-1">
      {DENSITIES.map((key) => {
        const def = DENSITY_DEFINITIONS[key]
        const isActive = current === key

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              'flex items-center justify-between rounded-lg px-3 py-2 text-left transition-colors',
              'hover:bg-[var(--surface-sunken)]',
              isActive && 'bg-[var(--surface-sunken)]',
            )}
          >
            <span className="text-base text-[var(--text-primary)]">{def.label}</span>
            {isActive && <span className="label-eyebrow">Active</span>}
          </button>
        )
      })}
    </div>
  )
}
