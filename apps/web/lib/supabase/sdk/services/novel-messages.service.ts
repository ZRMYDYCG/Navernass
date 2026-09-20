import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateNovelMessageDto } from '../types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export class NovelMessagesService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * 获取会话的所有消息
   */
  async getByConversationId(conversationId: string) {
    const { data, error } = await this.supabase
      .from('novel_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * 创建消息
   *
   * 兼容性同 upsert：parts 列不存在时自动降级。
   */
  async create(messageData: CreateNovelMessageDto) {
    const { data: { user } } = await this.supabase.auth.getUser()

    const buildPayload = (includeParts: boolean) => {
      const payload: Record<string, unknown> = {
        user_id: user?.id,
        conversation_id: messageData.conversation_id,
        novel_id: messageData.novel_id,
        role: messageData.role,
        content: messageData.content,
        model: messageData.model,
        tokens: messageData.tokens,
        thinking: messageData.thinking,
      }
      if (includeParts) payload.parts = messageData.parts ?? null
      return payload
    }

    const tryInsert = async (includeParts: boolean) => {
      const { data, error } = await this.supabase
        .from('novel_messages')
        .insert(buildPayload(includeParts))
        .select()
        .single()
      if (error) throw error
      return data
    }

    let data: any
    try {
      data = await tryInsert(true)
    } catch (err: any) {
      const msg = String(err?.message || '')
      const code = String(err?.code || '')
      const isMissingPartsColumn =
        msg.includes('parts') && (msg.includes('column') || msg.includes('schema'))
        || code === 'PGRST204'
        || code === '42703'

      if (isMissingPartsColumn) {
        console.warn(
          '[novel-messages] parts 列不存在，自动降级（请尽快执行迁移 add_novel_messages_parts.sql）',
        )
        data = await tryInsert(false)
      } else {
        throw err
      }
    }

    // 更新会话的 updated_at
    await this.supabase
      .from('novel_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', messageData.conversation_id)

    return data
  }

  /**
   * 更新消息 parts
   *
   * 用于：
   *   - 桥接工具 (propose_*) 的 accept / reject
   *   - ask_user 表单提交后把 submitted 状态落到 part.output
   *
   * 客户端不需要先查 messageId —— 由调用方（路由层）按
   * (conversationId, toolCallId) 找到 messageId 后再调本方法。
   */
  async update(id: string, updates: Partial<Pick<CreateNovelMessageDto, 'content' | 'parts' | 'thinking'>>) {
    const buildPayload = (includeParts: boolean) => {
      const payload: Record<string, unknown> = { ...updates }
      if (!includeParts) delete payload.parts
      return payload
    }

    const exec = async (includeParts: boolean) => {
      const { data, error } = await this.supabase
        .from('novel_messages')
        .update(buildPayload(includeParts))
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    }

    let data: any
    try {
      data = await exec(true)
    } catch (err: any) {
      const msg = String(err?.message || '')
      const code = String(err?.code || '')
      const isMissingPartsColumn =
        msg.includes('parts') && (msg.includes('column') || msg.includes('schema'))
        || code === 'PGRST204'
        || code === '42703'

      if (isMissingPartsColumn) {
        data = await exec(false)
      } else {
        throw err
      }
    }

    if (data?.conversation_id) {
      await this.supabase
        .from('novel_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', data.conversation_id)
    }

    return data
  }

  /**
   * 按 id upsert 消息（适合 stream onFinish 回写完整 parts）
   *
   * 关键兼容性：ai-sdk v6 的 useChat 自动生成的 message id 是短随机字符串（如
   * "poFNmEqMoOSggAbV"），不是 uuid。但 novel_messages.id 列是 uuid 类型，
   * 直接 upsert 会触发 22P02 invalid input syntax for type uuid。
   *
   * 处理：
   *   - 传入 id 是合法 uuid → 直接 upsert（首次入库 / 后续追加 parts 都走这里）
   *   - 传入 id 不是 uuid → 当作"新消息"，让 PG gen_random_uuid() 生成
   *     （后端不需要保留 ai-sdk id，前端 useChat 自己管理）
   *
   * 同样自动降级 parts 列不存在的情况。
   */
  async upsert(message: { id: string } & CreateNovelMessageDto) {
    const { data: { user } } = await this.supabase.auth.getUser()
    const idIsUuid = UUID_RE.test(message.id)

    const buildPayload = (includeParts: boolean) => {
      const payload: Record<string, unknown> = {
        user_id: user?.id,
        conversation_id: message.conversation_id,
        novel_id: message.novel_id,
        role: message.role,
        content: message.content,
        model: message.model,
        tokens: message.tokens,
        thinking: message.thinking,
      }
      if (idIsUuid) payload.id = message.id
      if (includeParts) payload.parts = message.parts ?? null
      return payload
    }

    const exec = async (includeParts: boolean) => {
      if (idIsUuid) {
        const { data, error } = await this.supabase
          .from('novel_messages')
          .upsert(buildPayload(includeParts), { onConflict: 'id' })
          .select()
          .single()
        if (error) throw error
        return data
      } else {
        // 非 uuid id → 直接 insert，让数据库生成 uuid
        const { data, error } = await this.supabase
          .from('novel_messages')
          .insert(buildPayload(includeParts))
          .select()
          .single()
        if (error) throw error
        return data
      }
    }

    let data: any
    try {
      data = await exec(true)
    } catch (err: any) {
      const msg = String(err?.message || '')
      const code = String(err?.code || '')
      const isMissingPartsColumn =
        msg.includes('parts') && (msg.includes('column') || msg.includes('schema'))
        || code === 'PGRST204'
        || code === '42703'

      if (isMissingPartsColumn) {
        console.warn(
          '[novel-messages] parts 列不存在，自动降级（请尽快执行迁移 add_novel_messages_parts.sql）',
        )
        data = await exec(false)
      } else {
        console.error('[novel-messages] upsert failed:', err)
        throw err
      }
    }

    await this.supabase
      .from('novel_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', message.conversation_id)

    return data
  }

  /**
   * 删除消息
   */
  async delete(id: string) {
    const { error } = await this.supabase.from('novel_messages').delete().eq('id', id)

    if (error) throw error
  }

  /**
   * 清空会话的所有消息
   */
  async clearByConversationId(conversationId: string) {
    const { error } = await this.supabase
      .from('novel_messages')
      .delete()
      .eq('conversation_id', conversationId)

    if (error) throw error
  }

  /**
   * 批量创建消息（用于导入对话历史）
   */
  async createBatch(messages: CreateNovelMessageDto[]) {
    const { data, error } = await this.supabase
      .from('novel_messages')
      .insert(messages)
      .select()

    if (error) throw error
    return data || []
  }
}
