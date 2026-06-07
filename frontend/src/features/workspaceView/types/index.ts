export type LayoutType = 'overview' | 'planning' | 'focus' | 'custom'
export type WidgetDensity = 'compact' | 'balanced' | 'expanded'
export type WidgetKey = 'calendar' | 'tasks' | 'study' | 'analytics'

export interface WorkspaceView {
  workspace_id: string
  layout_type: LayoutType
  visible_widgets: WidgetKey[]
  widget_density: WidgetDensity
  created_at: string
  updated_at: string
}

export interface UpdateWorkspaceViewPayload {
  layout_type?: LayoutType
  visible_widgets?: WidgetKey[]
  widget_density?: WidgetDensity
}

// ── Layout definitions ────────────────────────────────────────────────────

export interface LayoutDefinition {
  key: LayoutType
  label: string
  description: string
  /** Left-column widgets (wider, 3fr) */
  leftWidgets: WidgetKey[]
  /** Right-column widgets (narrower, 2fr) */
  rightWidgets: WidgetKey[]
  defaultWidgets: WidgetKey[]
}

export const LAYOUT_DEFINITIONS: Record<LayoutType, LayoutDefinition> = {
  overview: {
    key: 'overview',
    label: 'Overview',
    description: 'Tasks and calendar on the left, study and analytics on the right',
    leftWidgets: ['tasks', 'calendar'],
    rightWidgets: ['study', 'analytics'],
    defaultWidgets: ['calendar', 'tasks', 'study', 'analytics'],
  },
  planning: {
    key: 'planning',
    label: 'Planning',
    description: 'Calendar takes priority, tasks on the right',
    leftWidgets: ['calendar'],
    rightWidgets: ['tasks'],
    defaultWidgets: ['calendar', 'tasks'],
  },
  focus: {
    key: 'focus',
    label: 'Focus',
    description: 'Study session takes priority, tasks on the right',
    leftWidgets: ['study'],
    rightWidgets: ['tasks'],
    defaultWidgets: ['study', 'tasks'],
  },
  custom: {
    key: 'custom',
    label: 'Custom',
    description: 'Choose exactly which widgets to show',
    leftWidgets: ['tasks', 'calendar'],
    rightWidgets: ['study', 'analytics'],
    defaultWidgets: ['calendar', 'tasks', 'study', 'analytics'],
  },
}

// ── Widget registry ────────────────────────────────────────────────────────

export interface WidgetDefinition {
  key: WidgetKey
  label: string
  description: string
  /** Default grid column fraction */
  fraction: number
}

export const WIDGET_REGISTRY: Record<WidgetKey, WidgetDefinition> = {
  calendar: {
    key: 'calendar',
    label: 'Calendar',
    description: 'Events, exams, and deadlines',
    fraction: 3,
  },
  tasks: {
    key: 'tasks',
    label: 'Tasks',
    description: 'Your task list with quick-add',
    fraction: 3,
  },
  study: {
    key: 'study',
    label: 'Study',
    description: 'Active study sessions and timer',
    fraction: 2,
  },
  analytics: {
    key: 'analytics',
    label: 'Analytics',
    description: 'Progress stats and upcoming items',
    fraction: 2,
  },
}

export const ALL_WIDGET_KEYS: WidgetKey[] = ['calendar', 'tasks', 'study', 'analytics']

// ── Density definitions ────────────────────────────────────────────────────

export interface DensityDefinition {
  key: WidgetDensity
  label: string
  gap: string    // CSS value for gap between panels
  padding: string  // CSS value for outer page padding
}

export const DENSITY_DEFINITIONS: Record<WidgetDensity, DensityDefinition> = {
  compact:  { key: 'compact',  label: 'Compact',  gap: '12px', padding: '12px' },
  balanced: { key: 'balanced', label: 'Balanced', gap: '20px', padding: '20px' },
  expanded: { key: 'expanded', label: 'Expanded', gap: '28px', padding: '28px' },
}

// ── localStorage key ───────────────────────────────────────────────────────
export const VIEW_STORAGE_KEY = (workspaceId: string) => `studyos_view_${workspaceId}`
