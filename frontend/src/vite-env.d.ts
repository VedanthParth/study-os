/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the StudyOS backend API. Configured per environment. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
