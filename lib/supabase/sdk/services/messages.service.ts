import type { CreateMessageDto, Message } from '../types'
import type { SupabaseClient } from '@supabase/supabase-js'

export class MessagesService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }
  /**
   * 获取对话的所有消息
   */
  async getByConversationId(conversationId: string) {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * 创建消息
   */
  async create(messageData: CreateMessageDto) {
    const { data: { user } } = await this.supabase.auth.getUser()

    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        user_id: user?.id,
        conversation_id: messageData.conversation_id,
        role: messageData.role,
        content: messageData.content,
        model: messageData.model,
        tokens: messageData.tokens,
      })
      .select()
      .single()

    if (error) throw error

    // 更新对话的 updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', messageData.conversation_id)

    return data
  }

  /**
   * 更新消息
   */
  async update(id: string, updates: Partial<Pick<Message, 'content'>>) {
    const { data, error } = await this.supabase
      .from('messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // 更新对话的 updated_at
    if (data?.conversation_id) {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', data.conversation_id)
    }

    return data
  }

  /**
   * 删除消息
   */
  async delete(id: string) {
    const { error } = await supabase.from('messages').delete().eq('id', id)

    if (error) throw error
  }

  /**
   * 清空对话的所有消息
   */
  async clearByConversationId(conversationId: string) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId)

    if (error) throw error
  }

  /**
   * 批量创建消息（用于导入对话历史）
   */
  async createBatch(messages: CreateMessageDto[]) {
    const { data, error } = await this.supabase
      .from('messages')
      .insert(messages)
      .select()

    if (error) throw error
    return data || []
  }
}
