import { supabase } from "../supabase";

export interface Novel {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  category?: string;
  tags?: string[];
  word_count?: number;
  chapters?: number;
  status?: "draft" | "published" | "archived";
  created_at?: string;
  updated_at?: string;
  user_id?: string;
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
  getList: async (params?: { page?: number; pageSize?: number; status?: string }) => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("novels")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (params?.status) {
      query = query.eq("status", params.status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data,
      total: count || 0,
      page,
      pageSize,
    };
  },

  /**
   * 获取小说详情
   */
  getById: async (id: string) => {
    const { data, error } = await supabase.from("novels").select("*").eq("id", id).single();

    if (error) throw error;
    return data;
  },

  /**
   * 创建小说
   */
  create: async (novelData: CreateNovelDto) => {
    const { data, error } = await supabase
      .from("novels")
      .insert({
        title: novelData.title,
        description: novelData.description,
        category: novelData.category,
        tags: novelData.tags,
        status: "draft",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 更新小说
   */
  update: async (novelData: UpdateNovelDto) => {
    const { id, ...updates } = novelData;

    const { data, error } = await supabase
      .from("novels")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 删除小说
   */
  delete: async (id: string) => {
    const { error } = await supabase.from("novels").delete().eq("id", id);

    if (error) throw error;
  },
};
