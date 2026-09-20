import type { CreateTodoDto, Todo, UpdateTodoDto } from './types'
import { apiClient } from './client'

export const todosApi = {
  getList: async (): Promise<Todo[]> => {
    return apiClient.get<Todo[]>('/api/todos')
  },
  create: async (data: CreateTodoDto): Promise<Todo> => {
    return apiClient.post<Todo>('/api/todos', data)
  },
  update: async (data: UpdateTodoDto): Promise<Todo> => {
    return apiClient.patch<Todo>('/api/todos', data)
  },
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/todos?id=${id}`)
  }
}
