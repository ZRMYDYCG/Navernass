import type { CreateRelationshipDto, Relationship } from './types'
import { apiClient } from './client'

export const relationshipsApi = {
  getByNovelId: async (novelId: string): Promise<Relationship[]> => {
    return apiClient.get<Relationship[]>(`/api/novels/${novelId}/relationships`)
  },
  create: async (data: CreateRelationshipDto): Promise<Relationship> => {
    return apiClient.post<Relationship>('/api/relationships', data)
  },
  update: async (id: string, updates: Partial<Relationship> & { novel_id: string }): Promise<Relationship> => {
    return apiClient.put<Relationship>(`/api/relationships/${id}`, updates)
  },
  delete: async (id: string, novelId: string): Promise<void> => {
    return apiClient.delete<void>(`/api/relationships/${id}`, { params: { novelId } })
  },
}
