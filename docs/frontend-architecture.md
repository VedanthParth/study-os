# Frontend Architecture

## Folder Responsibilities

```
src/
├── app/          # App-level configuration (providers, root setup)
├── assets/       # Static assets (images, fonts, icons)
├── components/   # Globally reusable, domain-agnostic components
│   └── ui/       # Base UI primitives (PageContainer, SectionCard, etc.)
├── constants/    # App-wide constants (routes, config values)
├── features/     # Feature domains — the main product code
├── hooks/        # Globally reusable React hooks (not feature-specific)
├── layouts/      # App shell layout wrappers
├── pages/        # Route-level page components (thin, wire features together)
├── routes/       # React Router configuration
├── services/     # API client and HTTP service layer
├── store/        # Global Zustand store files
├── styles/       # Design tokens and global CSS
├── types/        # Shared TypeScript types
└── utils/        # Shared pure utility functions
```

## Feature Boundaries

Each domain under `features/` is self-contained:

```
features/<name>/
├── api/          # TanStack Query hooks for this feature's endpoints
├── components/   # UI components used only within this feature
├── hooks/        # Hooks specific to this feature
├── store/        # Zustand slices local to this feature (if needed)
├── types/        # TypeScript types for this feature's domain
└── utils/        # Pure functions for this feature's logic
```

**Rule:** A feature never imports from another feature directly. Cross-feature
communication goes through the global store or is lifted to a shared layer.

The current features are:
- `auth` — authentication and session management
- `workspace` — the main workspace/dashboard area
- `tasks` — task and assignment management
- `calendar` — scheduling and event views
- `study` — study sessions, timers, and focus modes
- `planner` — AI-assisted study planning
- `analytics` — progress and performance reporting
- `settings` — user preferences and configuration

## Layout Responsibilities

| Layout | When to use |
|---|---|
| `AppLayout` | Base shell with sidebar. All standard pages use this. |
| `DashboardLayout` | Sidebar + named TopBar. For content-heavy views. |
| `PlanningLayout` | Sidebar + TopBar + right detail panel. For calendar/planner. |
| `FocusLayout` | No sidebar, no chrome. For distraction-free study/timer modes. |

Layouts use React Router's `<Outlet />` — they never import pages directly.

## Reusable UI Philosophy

Components in `components/ui/` are:
- **Domain-agnostic** — they know nothing about features or business logic.
- **Prop-driven** — all content and behavior comes in via props.
- **Styled with design tokens** — never hardcoded colors or sizes; always `var(--token)`.

Adding a new shadcn/ui component: run `npx shadcn add <name>` from `frontend/`.
It lands in `components/ui/` and is immediately available.

## Routing Philosophy

- **Pages are thin.** A page component wires feature components together. It
  should contain no business logic of its own.
- **One route = one page component.** Avoid nesting unrelated responsibilities
  in a single page.
- **No auth guards yet.** Route protection will be added in a dedicated auth
  phase.
- All routes are defined in `routes/index.tsx`. The `ROUTES` constant in
  `constants/index.ts` is the single source of truth for path strings — never
  hardcode paths in NavLinks or `navigate()` calls.
