import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateNovelConversationDto, UpdateNovelConversationDto } from '../types'

export class NovelConversationsService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * 获取小说的所有会话
   */
  async getByNovelId(novelId: string) {
    const { data, error } = await this.supabase
      .from('novel_conversations')
      .select('*, message_count:novel_messages(count)')
      .eq('novel_id', novelId)
      .order('is_pinned', { ascending: false, nullsFirst: false })
      .order('pinned_at', { ascending: false, nullsFirst: false })
      .order('updated_at', { ascending: false })

    if (error) throw error

    return (data || []).map(conv => ({
      ...conv,
      message_count: Array.isArray(conv.message_count) ? conv.message_count[0]?.count || 0 : 0,
    }))
  }

  /**
   * 获取会话详情
   */
  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('novel_conversations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        const notFoundError = new Error('Novel conversation not found')
        Object.assign(notFoundError, {
          statusCode: 404,
          code: 'NOVEL_CONVERSATION_NOT_FOUND',
        })
        throw notFoundError
      }
      throw error
    }

    return data
  }

  /**
   * 创建会话
   */
  async create(conversationData: CreateNovelConversationDto) {
    const { data: { user } } = await this.supabase.auth.getUser()

    const { data, error } = await this.supabase
      .from('novel_conversations')
      .insert({
        user_id: user?.id,
        novel_id: conversationData.novel_id,
        title: conversationData.title,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * 更新会话
   */
  async update(id: string, updates: Partial<UpdateNovelConversationDto>) {
    await this.getById(id)

    // 如果设置了置顶状态，更新 pinned_at 时间
    const updateData: Record<string, unknown> = { ...updates }
    if (updates.is_pinned !== undefined) {
      updateData.pinned_at = updates.is_pinned ? new Date().toISOString() : null
    }

    const { data, error } = await this.supabase
      .from('novel_conversations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * 删除会话
   */
  async delete(id: string) {
    await this.getById(id)

    const { error } = await this.supabase.from('novel_conversations').delete().eq('id', id)

    if (error) throw error
  }

  /**
   * 获取小说的最近会话列表
   * 置顶的会话会优先显示
   */
  async getRecentByNovelId(novelId: string, limit: number = 10) {
    const { data, error } = await this.supabase
      .from('novel_conversations')
      .select('*')
      .eq('novel_id', novelId)
      .order('is_pinned', { ascending: false, nullsFirst: false })
      .order('pinned_at', { ascending: false, nullsFirst: false })
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }
}
