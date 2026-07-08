import type { WidgetKey } from '@/features/workspaceView/types'
import { ALL_WIDGET_KEYS, WIDGET_REGISTRY } from '@/features/workspaceView/types'
import { cn } from '@/utils/cn'

interface WidgetPickerProps {
  visibleWidgets: WidgetKey[]
  onToggle: (widget: WidgetKey) => void
}

export function WidgetPicker({ visibleWidgets, onToggle }: WidgetPickerProps) {
  return (
    <div className="flex flex-col gap-1 py-1">
      {ALL_WIDGET_KEYS.map((key) => {
        const def = WIDGET_REGISTRY[key]
        const isOn = visibleWidgets.includes(key)
        const isLastVisible = isOn && visibleWidgets.length === 1

        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            disabled={isLastVisible}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors',
              'hover:bg-[var(--surface-sunken)] disabled:cursor-not-allowed disabled:opacity-40',
            )}
          >
            <div>
              <p className="text-sm text-[var(--text-primary)]">{def.label}</p>
              <p className="text-xs text-[var(--text-tertiary)]">{def.description}</p>
            </div>
            <div
              className={cn(
                'ml-3 h-5 w-9 flex-shrink-0 rounded-full transition-colors',
                isOn ? 'bg-[var(--gray-900)]' : 'bg-[var(--border-default)]',
              )}
            >
              <div
                className={cn(
                  'mt-0.5 h-4 w-4 rounded-full bg-[var(--surface-card)] shadow transition-transform',
                  isOn ? 'translate-x-4' : 'translate-x-0.5',
                )}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}
