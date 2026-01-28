import type { Chapter, CreateVolumeDto, UpdateVolumeDto, Volume } from './types'
import { apiClient } from './client'

export const volumesApi = {
  /**
   * 获取小说的所有卷
   */
  getByNovelId: async (novelId: string): Promise<Volume[]> => {
    return apiClient.get<Volume[]>(`/api/novels/${novelId}/volumes`)
  },

  /**
   * 获取单个卷详情
   */
  getById: async (id: string): Promise<Volume> => {
    return apiClient.get<Volume>(`/api/volumes/${id}`)
  },

  /**
   * 创建卷
   */
  create: async (volumeData: CreateVolumeDto): Promise<Volume> => {
    return apiClient.post<Volume>('/api/volumes', volumeData)
  },

  /**
   * 更新卷
   */
  update: async (volumeData: UpdateVolumeDto): Promise<Volume> => {
    const { id, ...updates } = volumeData
    return apiClient.put<Volume>(`/api/volumes/${id}`, updates)
  },

  /**
   * 删除卷
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/volumes/${id}`)
  },

  /**
   * 批量更新卷顺序
   */
  updateOrder: async (volumes: Array<{ id: string, order_index: number }>): Promise<void> => {
    return apiClient.post<void>('/api/volumes/reorder', volumes)
  },

  /**
   * 获取卷下的所有章节
   */
  getChapters: async (volumeId: string): Promise<Chapter[]> => {
    return apiClient.get<Chapter[]>(`/api/volumes/${volumeId}/chapters`)
  },
}
