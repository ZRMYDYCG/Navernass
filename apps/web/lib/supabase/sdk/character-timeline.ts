import type {
  CharacterTimelineEvent,
  CreateCharacterTimelineEventDto,
  UpdateCharacterTimelineEventDto,
} from './types'
import { apiClient } from './client'

export const characterTimelineApi = {
  /** 某角色的事件列表 */
  listByCharacter: async (characterId: string): Promise<CharacterTimelineEvent[]> => {
    return apiClient.get<CharacterTimelineEvent[]>(`/api/editor/characters/${characterId}/timeline`)
  },

  /** 小说全部角色的事件 */
  listByNovel: async (novelId: string): Promise<CharacterTimelineEvent[]> => {
    return apiClient.get<CharacterTimelineEvent[]>(`/api/editor/novels/${novelId}/timeline`)
  },

  create: async (data: CreateCharacterTimelineEventDto): Promise<CharacterTimelineEvent> => {
    return apiClient.post<CharacterTimelineEvent>(
      `/api/editor/characters/${data.character_id}/timeline`,
      data,
    )
  },

  update: async (id: string, data: UpdateCharacterTimelineEventDto): Promise<CharacterTimelineEvent> => {
    return apiClient.patch<CharacterTimelineEvent>(`/api/editor/timeline-events/${id}`, data)
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/editor/timeline-events/${id}`)
  },
}
