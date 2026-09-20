import type { Chapter, CreateChapterDto, UpdateChapterDto } from './types'
import { apiClient } from './client'

export const chaptersApi = {
  /**
   * 获取小说的所有章节
   */
  getByNovelId: async (novelId: string): Promise<Chapter[]> => {
    return apiClient.get<Chapter[]>(`/api/novels/${novelId}/chapters`)
  },

  /**
   * 获取单个章节详情
   */
  getById: async (id: string): Promise<Chapter> => {
    return apiClient.get<Chapter>(`/api/chapters/${id}`)
  },

  /**
   * 创建章节
   */
  create: async (chapterData: CreateChapterDto): Promise<Chapter> => {
    return apiClient.post<Chapter>('/api/chapters', chapterData)
  },

  /**
   * 更新章节
   */
  update: async (chapterData: UpdateChapterDto): Promise<Chapter> => {
    const { id, ...updates } = chapterData
    return apiClient.put<Chapter>(`/api/chapters/${id}`, updates)
  },

  /**
   * 删除章节
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/chapters/${id}`)
  },

  /**
   * 批量更新章节顺序
   */
  updateOrder: async (chapters: Array<{ id: string, order_index: number }>): Promise<void> => {
    return apiClient.post<void>('/api/chapters/reorder', chapters)
  },

  /**
   * 发布章节
   */
  publish: async (id: string): Promise<Chapter> => {
    return apiClient.post<Chapter>(`/api/chapters/${id}/publish`)
  },

  /**
   * 取消发布章节
   */
  unpublish: async (id: string): Promise<Chapter> => {
    return apiClient.delete<Chapter>(`/api/chapters/${id}/publish`)
  },
}
