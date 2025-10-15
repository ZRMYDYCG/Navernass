import { supabase } from "../supabase";
import type { Message, CreateMessageDto } from "./types";

export const messagesApi = {
  /**
   * 获取对话的所有消息
   */
  getByConversationId: async (conversationId: string): Promise<Message[]> => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * 创建消息
   */
  create: async (messageData: CreateMessageDto): Promise<Message> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("未登录");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        user_id: user.id,
        conversation_id: messageData.conversation_id,
        role: messageData.role,
        content: messageData.content,
        model: messageData.model,
        tokens: messageData.tokens,
      })
      .select()
      .single();

    if (error) throw error;

    // 更新对话的 updated_at
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", messageData.conversation_id);

    return data;
  },

  /**
   * 删除消息
   */
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("messages").delete().eq("id", id);

    if (error) throw error;
  },

  /**
   * 清空对话的所有消息
   */
  clearByConversationId: async (conversationId: string): Promise<void> => {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId);

    if (error) throw error;
  },

  /**
   * 批量创建消息（用于导入对话历史）
   */
  createBatch: async (messages: CreateMessageDto[]): Promise<Message[]> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("未登录");

    const messagesWithUserId = messages.map((msg) => ({
      user_id: user.id,
      conversation_id: msg.conversation_id,
      role: msg.role,
      content: msg.content,
      model: msg.model,
      tokens: msg.tokens,
    }));

    const { data, error } = await supabase.from("messages").insert(messagesWithUserId).select();

    if (error) throw error;
    return data || [];
  },
};
