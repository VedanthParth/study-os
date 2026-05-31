import apiClient from '@/services/apiClient'

import type { AnalyticsOverview } from '../types'

export const analyticsApi = {
  getOverview: (workspaceId: string): Promise<AnalyticsOverview> =>
    apiClient
      .get<AnalyticsOverview>('/api/analytics/overview', { params: { workspace_id: workspaceId } })
      .then((r) => r.data),
}
