import { createBrowserRouter } from 'react-router-dom'

import { ROUTES } from '@/constants'
import { AppLayout } from '@/layouts/AppLayout'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { HomePage } from '@/pages/HomePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { StudyPage } from '@/pages/StudyPage'
import { WorkspacePage } from '@/pages/WorkspacePage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: ROUTES.HOME, element: <HomePage /> },
      { path: ROUTES.WORKSPACE, element: <WorkspacePage /> },
      { path: ROUTES.CALENDAR, element: <CalendarPage /> },
      { path: ROUTES.STUDY, element: <StudyPage /> },
      { path: ROUTES.ANALYTICS, element: <AnalyticsPage /> },
      { path: ROUTES.SETTINGS, element: <SettingsPage /> },
    ],
  },
])
