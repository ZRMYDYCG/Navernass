import type { CreateWorldbookEntryDto, UpdateWorldbookEntryDto, WorldbookCategory, WorldbookEntry } from './types'
import { apiClient } from './client'

export const worldbookApi = {
  /** 列出小说的世界观条目 */
  list: async (novelId: string, category?: WorldbookCategory): Promise<WorldbookEntry[]> => {
    const qs = category ? `?category=${encodeURIComponent(category)}` : ''
    return apiClient.get<WorldbookEntry[]>(`/api/editor/novels/${novelId}/worldbook${qs}`)
  },

  getById: async (id: string): Promise<WorldbookEntry> => {
    return apiClient.get<WorldbookEntry>(`/api/editor/worldbook/${id}`)
  },

  create: async (data: CreateWorldbookEntryDto): Promise<WorldbookEntry> => {
    return apiClient.post<WorldbookEntry>(`/api/editor/novels/${data.novel_id}/worldbook`, data)
  },

  update: async (id: string, data: UpdateWorldbookEntryDto): Promise<WorldbookEntry> => {
    return apiClient.patch<WorldbookEntry>(`/api/editor/worldbook/${id}`, data)
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/editor/worldbook/${id}`)
  },
}
