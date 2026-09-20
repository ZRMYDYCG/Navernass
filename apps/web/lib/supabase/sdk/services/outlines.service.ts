import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateOutlineDto, UpdateOutlineDto } from '../types'

export class OutlinesService {
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

  /** 列出小说的全部大纲节点。可按 volumeId 或 parentId 过滤。 */
  async getByNovelId(novelId: string, opts?: { volumeId?: string | null, parentId?: string | null }) {
    const userId = await this.requireUserId()
    let q = this.supabase
      .from('outlines')
      .select('*')
      .eq('novel_id', novelId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('order_index', { ascending: true })

    if (opts?.volumeId !== undefined) {
      if (opts.volumeId === null) q = q.is('volume_id', null)
      else q = q.eq('volume_id', opts.volumeId)
    }
    if (opts?.parentId !== undefined) {
      if (opts.parentId === null) q = q.is('parent_id', null)
      else q = q.eq('parent_id', opts.parentId)
    }

    const { data, error } = await q
    if (error) throw error
    return data || []
  }

  async getById(id: string) {
    const userId = await this.requireUserId()
    const { data, error } = await this.supabase
      .from('outlines')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    if (error) {
      if (error.code === 'PGRST116') {
        const e = new Error('Outline not found') as Error & { statusCode: number, code: string }
        e.statusCode = 404
        e.code = 'OUTLINE_NOT_FOUND'
        throw e
      }
      throw error
    }
    return data
  }

  async create(dto: CreateOutlineDto) {
    const userId = await this.requireUserId()
    let order = dto.order_index
    if (order === undefined) {
      // 同 parent / volume 范围下追加到尾部
      let q = this.supabase
        .from('outlines')
        .select('order_index')
        .eq('novel_id', dto.novel_id)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('order_index', { ascending: false })
        .limit(1)
      if (dto.parent_id !== undefined) {
        q = dto.parent_id === null ? q.is('parent_id', null) : q.eq('parent_id', dto.parent_id)
      }
      const { data: existing } = await q.maybeSingle()
      order = (existing?.order_index ?? -1) + 1
    }
    const { data, error } = await this.supabase
      .from('outlines')
      .insert({
        user_id: userId,
        novel_id: dto.novel_id,
        volume_id: dto.volume_id ?? null,
        parent_id: dto.parent_id ?? null,
        title: dto.title,
        content: dto.content || '',
        order_index: order,
      })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async update(id: string, updates: UpdateOutlineDto) {
    await this.getById(id)
    const { data, error } = await this.supabase
      .from('outlines')
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
      .from('outlines')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  }
}
