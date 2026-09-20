import type { CreateSurveyDto, Survey } from '../types'
import { apiClient } from '../client'

export const surveysApi = {
  /**
   * 提交调研问卷
   */
  create: async (data: CreateSurveyDto): Promise<Survey> => {
    return apiClient.post<Survey>('/api/surveys', data)
  },
}
