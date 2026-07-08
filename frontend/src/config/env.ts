/**
 * Centralized frontend configuration.
 *
 * Every environment-dependent value the frontend needs is resolved here from
 * Vite's `import.meta.env`, so no component or service hardcodes a URL, host, or
 * port. To point the app at a different backend, set `VITE_API_URL` in the
 * appropriate `.env` file (see `.env.example`) — nothing else needs to change.
 *
 * The localhost fallback is a development convenience only; production builds are
 * expected to provide `VITE_API_URL` explicitly.
 */

const DEV_API_URL = 'http://localhost:8000'

export const config = {
  /** Base URL of the backend API, without a trailing slash. */
  apiUrl: (import.meta.env.VITE_API_URL ?? DEV_API_URL).replace(/\/$/, ''),
} as const
