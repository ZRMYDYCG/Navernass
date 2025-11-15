import type { CreateNovelMessageDto } from '../types'
import { supabase } from '@/lib/supabase'

export class NovelMessagesService {
  /**
   * 获取会话的所有消息
   */
  async getByConversationId(conversationId: string) {
    const { data, error } = await supabase
      .from('novel_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * 创建消息
   */
  async create(messageData: CreateNovelMessageDto) {
    const { data, error } = await supabase
      .from('novel_messages')
      .insert({
        conversation_id: messageData.conversation_id,
        novel_id: messageData.novel_id,
        role: messageData.role,
        content: messageData.content,
        model: messageData.model,
        tokens: messageData.tokens,
        thinking: messageData.thinking,
      })
      .select()
      .single()

    if (error) throw error

    // 更新会话的 updated_at
    await supabase
      .from('novel_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', messageData.conversation_id)

    return data
  }

  /**
   * 删除消息
   */
  async delete(id: string) {
    const { error } = await supabase.from('novel_messages').delete().eq('id', id)

    if (error) throw error
  }

  /**
   * 清空会话的所有消息
   */
  async clearByConversationId(conversationId: string) {
    const { error } = await supabase
      .from('novel_messages')
      .delete()
      .eq('conversation_id', conversationId)

    if (error) throw error
  }

  /**
   * 批量创建消息（用于导入对话历史）
   */
  async createBatch(messages: CreateNovelMessageDto[]) {
    const { data, error } = await supabase
      .from('novel_messages')
      .insert(messages)
      .select()

    if (error) throw error
    return data || []
  }
}
