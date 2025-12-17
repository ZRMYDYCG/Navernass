import type { CreateConversationDto, UpdateConversationDto } from '../types'
import type { SupabaseClient } from '@supabase/supabase-js'

export class ConversationsService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }
  /**
   * 获取所有对话
   */
  async getList() {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * 获取对话详情
   */
  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        const notFoundError = new Error('Conversation not found')
        Object.assign(notFoundError, {
          statusCode: 404,
          code: 'CONVERSATION_NOT_FOUND',
        })
        throw notFoundError
      }
      throw error
    }

    return data
  }

  /**
   * 创建对话
   */
  async create(conversationData: CreateConversationDto) {
    const { data: { user } } = await this.supabase.auth.getUser()

    const { data, error } = await this.supabase
      .from('conversations')
      .insert({
        user_id: user?.id,
        title: conversationData.title,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * 更新对话
   */
  async update(id: string, updates: Partial<UpdateConversationDto>) {
    await this.getById(id)

    // 如果设置了置顶状态，更新 pinned_at 时间
    const updateData: Record<string, unknown> = { ...updates }
    if (updates.is_pinned !== undefined) {
      updateData.pinned_at = updates.is_pinned ? new Date().toISOString() : null
    }

    const { data, error } = await this.supabase
      .from('conversations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * 删除对话
   */
  async delete(id: string) {
    await this.getById(id)

    const { error } = await this.supabase.from('conversations').delete().eq('id', id)

    if (error) throw error
  }

  /**
   * 获取最近的对话列表
   * 置顶的对话会优先显示
   */
  async getRecent(limit: number = 10) {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .order('is_pinned', { ascending: false, nullsFirst: false })
      .order('pinned_at', { ascending: false, nullsFirst: false })
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }
}
