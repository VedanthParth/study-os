# Coding Rules

## TypeScript

- **Strict mode is non-negotiable.** `"strict": true` is set in `tsconfig.app.json` and must never be weakened.
- **No `any` types.** ESLint enforces `@typescript-eslint/no-explicit-any: error`. Use `unknown` + type narrowing or define a proper type.
- **Use type imports.** Import types with `import type { Foo }` to keep runtime bundles clean. ESLint enforces `consistent-type-imports`.

## Frontend Architecture

- **Feature-based folder structure.** Code is organized by feature domain under `src/features/<domain>/`, not by technical layer. Each feature owns its components, hooks, and local state.
- **No business logic inside React components.** Components handle rendering and user interaction only. Move data transformations, calculations, and decision logic into hooks or services.
- **No direct fetch calls outside services.** All API calls go through service functions in `src/services/` or `src/features/<domain>/services/`. Components interact with services via TanStack Query hooks, never raw `fetch` or `axios`.
- **One component per file.** Collocate the component's types and helpers in the same file only if they are trivially small and used nowhere else.

## Backend Architecture

- **Thin API routes.** Route handlers in `app/api/` do three things only: parse the request, call a service, return the response. No business logic.
- **Service layer owns business logic.** All rules, calculations, and orchestration live in `app/services/`. Services are plain Python functions — no FastAPI imports.
- **Repository pattern for data access.** All database queries go through repository functions in `app/repositories/`. Services call repositories; routes never touch the database directly.
- **Schemas are the contract boundary.** Pydantic schemas in `app/schemas/` define what enters and exits the API. ORM models in `app/models/` are never returned directly from routes.

## Git Discipline

- **Small, focused commits.** Each commit changes one logical thing. Prefer ten small commits over one large one.
- **One feature at a time.** Open a PR for one feature. Do not mix unrelated changes.
- **Commit messages describe the why, not the what.** The diff already shows what changed; the message explains why it was necessary.
