import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateWorldbookEntryDto, UpdateWorldbookEntryDto, WorldbookCategory } from '../types'

export class WorldbookEntriesService {
  private supabase: SupabaseClient
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  private async requireUserId() {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error || !user) {
      const e = new Error('Unauthorized') as Error & { statusCode: number, code: string }
      e.statusCode = 401
      e.code = 'UNAUTHORIZED'
      throw e
    }
    return user.id
  }

  /** 列出小说的全部世界观条目（不含已删除）。可按 category 过滤。 */
  async getByNovelId(novelId: string, category?: WorldbookCategory) {
    const userId = await this.requireUserId()
    let q = this.supabase
      .from('worldbook_entries')
      .select('*')
      .eq('novel_id', novelId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('order_index', { ascending: true })

    if (category) q = q.eq('category', category)
    const { data, error } = await q
    if (error) throw error
    return data || []
  }

  async getById(id: string) {
    const userId = await this.requireUserId()
    const { data, error } = await this.supabase
      .from('worldbook_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    if (error) {
      if (error.code === 'PGRST116') {
        const e = new Error('Worldbook entry not found') as Error & { statusCode: number, code: string }
        e.statusCode = 404
        e.code = 'WORLDBOOK_ENTRY_NOT_FOUND'
        throw e
      }
      throw error
    }
    return data
  }

  async create(dto: CreateWorldbookEntryDto) {
    const userId = await this.requireUserId()
    // 自动 order_index = 当前最大值 + 1
    let order = dto.order_index
    if (order === undefined) {
      const { data: existing } = await this.supabase
        .from('worldbook_entries')
        .select('order_index')
        .eq('novel_id', dto.novel_id)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle()
      order = (existing?.order_index ?? -1) + 1
    }
    const { data, error } = await this.supabase
      .from('worldbook_entries')
      .insert({
        user_id: userId,
        novel_id: dto.novel_id,
        category: dto.category || 'other',
        title: dto.title,
        content: dto.content || '',
        keywords: dto.keywords || [],
        order_index: order,
      })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async update(id: string, updates: UpdateWorldbookEntryDto) {
    await this.getById(id)
    const { data, error } = await this.supabase
      .from('worldbook_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async delete(id: string) {
    await this.getById(id)
    const { error } = await this.supabase
      .from('worldbook_entries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  }

  /** 物理删除全部（导出/重置时用） */
  async deleteByNovelId(novelId: string) {
    const userId = await this.requireUserId()
    const { error } = await this.supabase
      .from('worldbook_entries')
      .delete()
      .eq('novel_id', novelId)
      .eq('user_id', userId)
    if (error) throw error
  }
}
