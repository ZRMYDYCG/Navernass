import type { CreateCharacterDto } from './types'
import { apiClient } from './client'

export interface NovelCharacter {
  id: string
  novel_id?: string
  name: string
  role?: string
  avatar?: string
  color?: string
  description?: string
  traits?: string[]
  keywords?: string[]
  first_appearance?: string
  note?: string
  order_index?: number
}

export const charactersApi = {
  getByNovelId: async (novelId: string): Promise<NovelCharacter[]> => {
    return apiClient.get<NovelCharacter[]>(`/api/novels/${novelId}/characters`)
  },
  getById: async (id: string): Promise<NovelCharacter> => {
    return apiClient.get<NovelCharacter>(`/api/characters/${id}`)
  },
  create: async (data: CreateCharacterDto): Promise<NovelCharacter> => {
    return apiClient.post<NovelCharacter>('/api/characters', data)
  },
  update: async (id: string, updates: Partial<NovelCharacter>): Promise<NovelCharacter> => {
    return apiClient.put<NovelCharacter>(`/api/characters/${id}`, updates)
  },
  delete: async (id: string, novelId: string): Promise<void> => {
    return apiClient.delete<void>(`/api/characters/${id}`, { params: { novelId } })
  },
}
