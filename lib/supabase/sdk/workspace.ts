import { apiClient } from './client'

export interface WorkspaceStats {
  novelCount: number
  totalWordCount: number
  finishedChapterCount: number
  characterCount: number
  streak: number
}

export interface ActivityItem {
  date: string
  count: number
  level: number
}

export const workspaceApi = {
  getStats: async (): Promise<WorkspaceStats> => {
    return apiClient.get<WorkspaceStats>('/api/workspace/stats')
  },
  getActivity: async (): Promise<ActivityItem[]> => {
    return apiClient.get<ActivityItem[]>('/api/workspace/activity')
  }
}
