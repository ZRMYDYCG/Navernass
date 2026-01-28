import type {
  CreateNovelDto,
  Novel,
  PaginationParams,
  PaginationResult,
  UpdateNovelDto,
} from './types'
import { apiClient } from './client'

export const novelsApi = {
  /**
   * 获取小说列表
   */
  getList: async (
    params?: PaginationParams & { status?: string },
  ): Promise<PaginationResult<Novel>> => {
    return apiClient.get<PaginationResult<Novel>>('/api/novels', { params })
  },

  /**
   * 获取小说详情
   */
  getById: async (id: string): Promise<Novel> => {
    return apiClient.get<Novel>(`/api/novels/${id}`)
  },

  /**
   * 创建小说
   */
  create: async (novelData: CreateNovelDto): Promise<Novel> => {
    return apiClient.post<Novel>('/api/novels', novelData)
  },

  /**
   * 更新小说
   */
  update: async (novelData: UpdateNovelDto): Promise<Novel> => {
    const { id, ...updates } = novelData
    return apiClient.put<Novel>(`/api/novels/${id}`, updates)
  },

  /**
   * 删除小说（硬删除）
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/novels/${id}`)
  },

  /**
   * 归档小说
   */
  archive: async (id: string): Promise<Novel> => {
    return apiClient.post<Novel>(`/api/novels/${id}/archive`)
  },

  /**
   * 恢复小说（从归档状态恢复）
   */
  restore: async (id: string): Promise<Novel> => {
    return apiClient.post<Novel>(`/api/novels/${id}/restore`)
  },

  /**
   * 发布小说
   */
  publish: async (id: string): Promise<Novel> => {
    return apiClient.post<Novel>(`/api/novels/${id}/publish`)
  },

  /**
   * 取消发布
   */
  unpublish: async (id: string): Promise<Novel> => {
    return apiClient.delete<Novel>(`/api/novels/${id}/publish`)
  },

  /**
   * 获取回收站中的小说列表
   */
  getArchived: async (): Promise<Novel[]> => {
    return apiClient.get<Novel[]>('/api/novels/archived')
  },

  updateOrder: async (novels: Array<{ id: string, order_index: number }>): Promise<void> => {
    return apiClient.post<void>('/api/novels/reorder', novels)
  },
}
