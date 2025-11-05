import { supabase } from "@/lib/supabase";
import type { Conversation, CreateConversationDto, UpdateConversationDto } from "../types";

export class ConversationsService {
  /**
   * 获取所有对话
   */
  async getList(params?: { novelId?: string }) {
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
  }

  /**
   * 获取对话详情
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw {
          statusCode: 404,
          code: "CONVERSATION_NOT_FOUND",
          message: "Conversation not found",
        };
      }
      throw error;
    }

    return data;
  }

  /**
   * 创建对话
   */
  async create(conversationData: CreateConversationDto) {
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        title: conversationData.title,
        novel_id: conversationData.novel_id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 更新对话
   */
  async update(id: string, updates: Partial<UpdateConversationDto>) {
    await this.getById(id);

    const { data, error } = await supabase
      .from("conversations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 删除对话
   */
  async delete(id: string) {
    await this.getById(id);

    const { error } = await supabase.from("conversations").delete().eq("id", id);

    if (error) throw error;
  }

  /**
   * 获取最近的对话列表
   */
  async getRecent(limit: number = 10) {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}

