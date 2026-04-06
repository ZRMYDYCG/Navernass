import type { WorkspaceStats } from './types'
import { apiClient } from './client'

export interface WeatherData {
  available: boolean
  city?: string
  country?: string
  temperature?: number
  weatherCode?: number
  windSpeed?: number
}

export const workspaceApi = {
  getStats: async (): Promise<WorkspaceStats> => {
    return apiClient.get<WorkspaceStats>('/api/workspace')
  },
  getWeather: async (): Promise<WeatherData> => {
    return apiClient.get<WeatherData>('/api/workspace/weather')
  },
}
