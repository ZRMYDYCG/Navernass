import type { WorkspaceStats } from './types'
import { apiClient } from './client'

export const workspaceApi = {
  getStats: async (): Promise<WorkspaceStats> => {
    return apiClient.get<WorkspaceStats>('/api/workspace')
  },
}
