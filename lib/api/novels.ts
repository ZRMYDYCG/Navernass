import { supabase } from "../supabase";
import type {
  Novel,
  CreateNovelDto,
  UpdateNovelDto,
  PaginationParams,
  PaginationResult,
} from "./types";

export const novelsApi = {
  /**
   * 获取小说列表
   */
  getList: async (
    params?: PaginationParams & { status?: string }
  ): Promise<PaginationResult<Novel>> => {
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
    } else {
      // 默认排除已归档的小说
      query = query.neq("status", "archived");
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    };
  },

  /**
   * 获取小说详情
   */
  getById: async (id: string): Promise<Novel> => {
    const { data, error } = await supabase.from("novels").select("*").eq("id", id).single();

    if (error) throw error;
    return data;
  },

  /**
   * 创建小说
   */
  create: async (novelData: CreateNovelDto): Promise<Novel> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("未登录");

    const { data, error } = await supabase
      .from("novels")
      .insert({
        user_id: user.id,
        title: novelData.title,
        description: novelData.description,
        cover: novelData.cover,
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
  update: async (novelData: UpdateNovelDto): Promise<Novel> => {
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
   * 删除小说（软删除 - 归档）
   */
  archive: async (id: string): Promise<Novel> => {
    const { data, error } = await supabase
      .from("novels")
      .update({ status: "archived" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 获取回收站中的小说列表
   */
  getArchived: async (): Promise<Novel[]> => {
    const { data, error } = await supabase
      .from("novels")
      .select("*")
      .eq("status", "archived")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * 恢复小说（从归档状态恢复）
   */
  restore: async (id: string): Promise<Novel> => {
    const { data, error } = await supabase
      .from("novels")
      .update({ status: "draft" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 删除小说（硬删除）
   */
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("novels").delete().eq("id", id);

    if (error) throw error;
  },

  /**
   * 发布小说
   */
  publish: async (id: string): Promise<Novel> => {
    const { data, error } = await supabase
      .from("novels")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 取消发布
   */
  unpublish: async (id: string): Promise<Novel> => {
    const { data, error } = await supabase
      .from("novels")
      .update({ status: "draft" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
