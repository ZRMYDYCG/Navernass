import type { CreateNewsDto, News, PaginationResult, UpdateNewsDto } from './types'
import { apiClient } from './client'

export const newsApi = {
  /**
   * 获取新闻列表
   */
  getList: (params?: {
    type?: string
    status?: string
    page?: number
    pageSize?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.type) searchParams.append('type', params.type)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString())

    const query = searchParams.toString()
    return apiClient.get<PaginationResult<News>>(`/api/news${query ? `?${query}` : ''}`)
  },

  /**
   * 获取新闻详情
   */
  getById: (id: string) => {
    return apiClient.get<News>(`/api/news/${id}`)
  },

  /**
   * 创建新闻
   */
  create: (data: CreateNewsDto) => {
    return apiClient.post<News>('/api/news', data)
  },

  /**
   * 更新新闻
   */
  update: (id: string, data: Partial<UpdateNewsDto>) => {
    return apiClient.put<News>(`/api/news/${id}`, data)
  },

  /**
   * 删除新闻
   */
  delete: (id: string) => {
    return apiClient.delete(`/api/news/${id}`)
  },
}
