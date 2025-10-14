import { api } from "../axios";

export interface Novel {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  category?: string;
  tags?: string[];
  wordCount?: number;
  chapters?: number;
  status?: "draft" | "published" | "archived";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNovelDto {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export interface UpdateNovelDto extends Partial<CreateNovelDto> {
  id: string;
}

export const novelsApi = {
  /**
   * 获取小说列表
   */
  getList: (params?: { page?: number; pageSize?: number; status?: string }) => api.get("/novels", { params }),

  /**
   * 获取小说详情
   */
  getById: (id: string) => api.get(`/novels/${id}`),

  /**
   * 创建小说
   */
  create: (data: CreateNovelDto) => api.post("/novels", data),

  /**
   * 更新小说
   */
  update: (data: UpdateNovelDto) => api.put(`/novels/${data.id}`, data),

  /**
   * 删除小说
   */
  delete: (id: string) => api.delete(`/novels/${id}`),
};
