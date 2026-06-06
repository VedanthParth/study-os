import { Settings2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import type { LayoutType, WidgetDensity, WidgetKey } from '@/features/workspaceView/types'
import { LAYOUT_DEFINITIONS, WIDGET_REGISTRY } from '@/features/workspaceView/types'
import { cn } from '@/lib/utils'

import { DensityPicker } from './DensityPicker'
import { WidgetPicker } from './WidgetPicker'

type Tab = 'layout' | 'widgets' | 'density'

interface WorkspaceViewControlsProps {
  layoutType: LayoutType
  visibleWidgets: WidgetKey[]
  density: WidgetDensity
  onLayoutChange: (layout: LayoutType) => void
  onWidgetToggle: (widget: WidgetKey) => void
  onDensityChange: (density: WidgetDensity) => void
}

const LAYOUTS: LayoutType[] = ['overview', 'planning', 'focus', 'custom']

export function WorkspaceViewControls({
  layoutType,
  visibleWidgets,
  density,
  onLayoutChange,
  onWidgetToggle,
  onDensityChange,
}: WorkspaceViewControlsProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('layout')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex min-h-[var(--control-h-sm)] items-center gap-2 rounded-[var(--radius-control)] border px-3.5 text-base transition-colors',
          open
            ? 'border-[var(--border-strong)] bg-[var(--surface-sunken)] text-[var(--text-primary)]'
            : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]',
        )}
      >
        <Settings2 size={16} />
        Customise
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1.5 w-64 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-lg)]">
          {/* Tabs */}
          <div className="flex border-b border-[var(--border-subtle)] px-2 pt-2">
            {(['layout', 'widgets', 'density'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'rounded-t-md px-3 py-1.5 text-xs capitalize transition-colors',
                  tab === t
                    ? 'bg-[var(--surface-sunken)] font-medium text-[var(--text-primary)]'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]',
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-2">
            {tab === 'layout' && (
              <div className="flex flex-col gap-1 py-1">
                {LAYOUTS.map((key) => {
                  const def = LAYOUT_DEFINITIONS[key]
                  const isActive = layoutType === key
                  return (
                    <button
                      key={key}
                      onClick={() => { onLayoutChange(key); setTab('widgets') }}
                      className={cn(
                        'flex items-start gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--surface-sunken)]',
                        isActive && 'bg-[var(--surface-sunken)]',
                      )}
                    >
                      <div className="flex-1">
                        <p className="text-sm text-[var(--text-primary)]">{def.label}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{def.description}</p>
                      </div>
                      {isActive && (
                        <span className="label-eyebrow mt-1 flex-shrink-0">Active</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {tab === 'widgets' && (
              <>
                <div className="flex items-center justify-between px-1 pt-2">
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {visibleWidgets.length} of 4 widgets visible
                  </p>
                  <span className="text-[10px] text-[var(--text-tertiary)]">
                    {WIDGET_REGISTRY[visibleWidgets[0]]?.label}…
                  </span>
                </div>
                <WidgetPicker visibleWidgets={visibleWidgets} onToggle={onWidgetToggle} />
              </>
            )}

            {tab === 'density' && (
              <DensityPicker current={density} onChange={onDensityChange} />
            )}
          </div>

          <div className="border-t border-[var(--border-subtle)] px-4 py-2">
            <p className="text-[10px] text-[var(--text-tertiary)]">
              Settings are saved per workspace.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
