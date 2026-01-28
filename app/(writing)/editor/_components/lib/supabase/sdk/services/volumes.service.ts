import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateVolumeDto, UpdateVolumeDto } from '../types'

export class VolumesService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * 获取小说的所有卷（不包含已删除的）
   */
  async getByNovelId(novelId: string) {
    const { data, error } = await this.supabase
      .from('volumes')
      .select('*')
      .eq('novel_id', novelId)
      .is('deleted_at', null)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * 获取小说的所有卷（包括已删除的，用于恢复）
   */
  async getAllByNovelId(novelId: string) {
    const { data, error } = await this.supabase
      .from('volumes')
      .select('*')
      .eq('novel_id', novelId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * 获取单个卷
   */
  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('volumes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        const notFoundError = new Error('Volume not found') as Error & {
          statusCode: number
          code: string
        }
        notFoundError.statusCode = 404
        notFoundError.code = 'VOLUME_NOT_FOUND'
        throw notFoundError
      }
      throw error
    }

    return data
  }

  /**
   * 创建卷
   */
  async create(volumeData: CreateVolumeDto) {
    const { data: { user } } = await this.supabase.auth.getUser()

    const { data, error } = await this.supabase
      .from('volumes')
      .insert({
        user_id: user?.id,
        novel_id: volumeData.novel_id,
        title: volumeData.title,
        description: volumeData.description || '',
        order_index: volumeData.order_index,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * 更新卷
   */
  async update(id: string, updates: Partial<UpdateVolumeDto>) {
    await this.getById(id)

    const { data, error } = await this.supabase
      .from('volumes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * 删除卷（软删除）
   */
  async delete(id: string) {
    await this.getById(id)

    const { error } = await this.supabase
      .from('volumes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }

  /**
   * 归档小说的所有卷（软删除）
   */
  async archiveByNovelId(novelId: string) {
    const { error } = await this.supabase
      .from('volumes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('novel_id', novelId)
      .is('deleted_at', null)

    if (error) throw error
  }

  /**
   * 恢复小说的所有卷
   */
  async restoreByNovelId(novelId: string) {
    const { error } = await this.supabase
      .from('volumes')
      .update({ deleted_at: null })
      .eq('novel_id', novelId)
      .not('deleted_at', 'is', null)

    if (error) throw error
  }

  /**
   * 永久删除小说的所有卷
   */
  async deleteByNovelId(novelId: string) {
    const { error } = await this.supabase
      .from('volumes')
      .delete()
      .eq('novel_id', novelId)

    if (error) throw error
  }

  /**
   * 批量更新卷顺序
   */
  async updateOrder(volumes: Array<{ id: string, order_index: number }>) {
    const promises = volumes.map(({ id, order_index }) =>
      this.supabase.from('volumes').update({ order_index }).eq('id', id),
    )

    const results = await Promise.all(promises)
    const errors = results.filter(r => r.error)

    if (errors.length > 0) {
      const updateError = new Error('Failed to update volume order') as Error & {
        statusCode: number
        code: string
      }
      updateError.statusCode = 400
      updateError.code = 'UPDATE_ORDER_FAILED'
      throw updateError
    }
  }

  /**
   * 获取卷下的所有章节
   */
  async getChapters(volumeId: string) {
    const { data, error } = await this.supabase
      .from('chapters')
      .select('*')
      .eq('volume_id', volumeId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data || []
  }
}
