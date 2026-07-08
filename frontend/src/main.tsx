import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { applyTheme, useSettingsStore } from '@/features/settings/store'
import { router } from '@/routes'

// Apply the persisted theme before the first paint to avoid a flash of the
// wrong palette. The store reads the same localStorage value on init.
applyTheme(useSettingsStore.getState().theme)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
