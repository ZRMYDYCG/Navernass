import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreatePlanFileDto, UpdatePlanFileDto } from '../types'
import { normalizePlanPath } from '@/lib/editor/plan-path'

export class PlanFilesService {
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

  async getByNovelId(novelId: string) {
    const userId = await this.requireUserId()
    const { data, error } = await this.supabase
      .from('plan_files')
      .select('*')
      .eq('novel_id', novelId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('order_index', { ascending: true })
    if (error) throw error
    return data || []
  }

  async getById(id: string) {
    const userId = await this.requireUserId()
    const { data, error } = await this.supabase
      .from('plan_files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    if (error) {
      if (error.code === 'PGRST116') {
        const e = new Error('Plan file not found') as Error & { statusCode: number, code: string }
        e.statusCode = 404
        e.code = 'PLAN_FILE_NOT_FOUND'
        throw e
      }
      throw error
    }
    return data
  }

  async getByPath(novelId: string, path: string) {
    const userId = await this.requireUserId()
    const slug = normalizePlanPath(path)
    const { data, error } = await this.supabase
      .from('plan_files')
      .select('*')
      .eq('novel_id', novelId)
      .eq('user_id', userId)
      .eq('path', slug)
      .is('deleted_at', null)
      .maybeSingle()
    if (error) throw error
    return data
  }

  async create(dto: CreatePlanFileDto) {
    const userId = await this.requireUserId()
    const slug = normalizePlanPath(dto.path)
    if (!slug) {
      const e = new Error('path is required') as Error & { statusCode: number, code: string }
      e.statusCode = 400
      e.code = 'INVALID_PATH'
      throw e
    }

    let order = dto.order_index
    if (order === undefined) {
      const { data: existing } = await this.supabase
        .from('plan_files')
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
      .from('plan_files')
      .insert({
        user_id: userId,
        novel_id: dto.novel_id,
        path: slug,
        name: dto.name?.trim() || slug,
        content: dto.content || '',
        order_index: order,
      })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async update(id: string, updates: UpdatePlanFileDto) {
    await this.getById(id)
    const payload: UpdatePlanFileDto = { ...updates }
    if (payload.path !== undefined) {
      payload.path = normalizePlanPath(payload.path)
    }
    const { data, error } = await this.supabase
      .from('plan_files')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async delete(id: string) {
    await this.getById(id)
    const { error } = await this.supabase
      .from('plan_files')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  }
}
