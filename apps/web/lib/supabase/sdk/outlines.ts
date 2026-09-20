import type { CreateOutlineDto, Outline, UpdateOutlineDto } from './types'
import { apiClient } from './client'

export const outlinesApi = {
  list: async (novelId: string, opts?: { volumeId?: string | null, parentId?: string | null }): Promise<Outline[]> => {
    const params = new URLSearchParams()
    if (opts?.volumeId !== undefined) params.set('volumeId', opts.volumeId === null ? '__null__' : opts.volumeId)
    if (opts?.parentId !== undefined) params.set('parentId', opts.parentId === null ? '__null__' : opts.parentId)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return apiClient.get<Outline[]>(`/api/editor/novels/${novelId}/outlines${qs}`)
  },

  getById: async (id: string): Promise<Outline> => {
    return apiClient.get<Outline>(`/api/editor/outlines/${id}`)
  },

  create: async (data: CreateOutlineDto): Promise<Outline> => {
    return apiClient.post<Outline>(`/api/editor/novels/${data.novel_id}/outlines`, data)
  },

  update: async (id: string, data: UpdateOutlineDto): Promise<Outline> => {
    return apiClient.patch<Outline>(`/api/editor/outlines/${id}`, data)
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/editor/outlines/${id}`)
  },
}
