import { supabase } from "../supabase";
import type { Conversation, CreateConversationDto, UpdateConversationDto } from "./types";

export const conversationsApi = {
  /**
   * 获取所有对话
   */
  getList: async (params?: { novelId?: string }): Promise<Conversation[]> => {
    let query = supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    // 如果指定了 novelId，只获取该小说的对话
    if (params?.novelId) {
      query = query.eq("novel_id", params.novelId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * 获取对话详情
   */
  getById: async (id: string): Promise<Conversation> => {
    const { data, error } = await supabase.from("conversations").select("*").eq("id", id).single();

    if (error) throw error;
    return data;
  },

  /**
   * 创建对话
   */
  create: async (conversationData: CreateConversationDto): Promise<Conversation> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("未登录");

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title: conversationData.title,
        novel_id: conversationData.novel_id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 更新对话
   */
  update: async (conversationData: UpdateConversationDto): Promise<Conversation> => {
    const { id, ...updates } = conversationData;

    const { data, error } = await supabase
      .from("conversations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 删除对话
   */
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("conversations").delete().eq("id", id);

    if (error) throw error;
  },

  /**
   * 获取最近的对话列表
   */
  getRecent: async (limit: number = 10): Promise<Conversation[]> => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};
