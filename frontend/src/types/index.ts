// Shared global TypeScript types.
// Feature-specific types live in features/<name>/types/.

export type ID = string

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export interface ApiError {
  message: string
  status: number
}
