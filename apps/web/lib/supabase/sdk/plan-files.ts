import type { CreatePlanFileDto, PlanFile, UpdatePlanFileDto } from './types'
import { apiClient } from './client'

export const planFilesApi = {
  list: async (novelId: string): Promise<PlanFile[]> => {
    return apiClient.get<PlanFile[]>(`/api/editor/novels/${novelId}/plan-files`)
  },

  getById: async (id: string): Promise<PlanFile> => {
    return apiClient.get<PlanFile>(`/api/editor/plan-files/${id}`)
  },

  create: async (data: CreatePlanFileDto): Promise<PlanFile> => {
    return apiClient.post<PlanFile>(`/api/editor/novels/${data.novel_id}/plan-files`, data)
  },

  update: async (id: string, data: UpdatePlanFileDto): Promise<PlanFile> => {
    return apiClient.patch<PlanFile>(`/api/editor/plan-files/${id}`, data)
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/editor/plan-files/${id}`)
  },
}
