import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CreateNovelDto,
  PaginationParams,
  UpdateNovelDto,
} from '../types'
import { ChaptersService } from './chapters.service'
import { VolumesService } from './volumes.service'

export class NovelsService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * 获取小说列表
   */
  async getList(params?: PaginationParams & { status?: string }) {
    const page = params?.page || 1
    const pageSize = params?.pageSize || 10
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = this.supabase
      .from('novels')
      .select('*', { count: 'exact' })
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (params?.status) {
      query = query.eq('status', params.status)
    } else {
      query = query.neq('status', 'archived')
    }

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    }
  }

  /**
   * 获取小说详情
   */
  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('novels')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        const notFoundError = new Error('Novel not found') as Error & { statusCode: number, code: string }
        notFoundError.statusCode = 404
        notFoundError.code = 'NOVEL_NOT_FOUND'
        throw notFoundError
      }
      throw error
    }

    return data
  }

  /**
   * 创建小说
   */
  async create(novelData: CreateNovelDto) {
    if (!novelData.title || novelData.title.trim().length === 0) {
      const validationError = new Error('Title is required') as Error & { statusCode: number, code: string }
      validationError.statusCode = 400
      validationError.code = 'INVALID_TITLE'
      throw validationError
    }

    const { data: { user } } = await this.supabase.auth.getUser()

    const { data, error } = await this.supabase
      .from('novels')
      .insert({
        user_id: user?.id,
        title: novelData.title,
        description: novelData.description,
        cover: novelData.cover,
        category: novelData.category,
        tags: novelData.tags,
        status: 'draft',
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, updates: Partial<UpdateNovelDto>) {
    await this.getById(id)

    const { data, error } = await this.supabase
      .from('novels')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(id: string) {
    const novel = await this.getById(id)

    const chaptersService = new ChaptersService(this.supabase)
    const volumesService = new VolumesService(this.supabase)

    await chaptersService.deleteByNovelId(id)
    await volumesService.deleteByNovelId(id)

    const { error } = await this.supabase.from('novels').delete().eq('id', id)

    if (error) throw error
  }

  async archive(id: string) {
    const chaptersService = new ChaptersService(this.supabase)
    const volumesService = new VolumesService(this.supabase)

    await Promise.all([
      this.update(id, { status: 'archived' }),
      chaptersService.archiveByNovelId(id),
      volumesService.archiveByNovelId(id),
    ])

    return this.getById(id)
  }

  async restore(id: string) {
    const chaptersService = new ChaptersService(this.supabase)
    const volumesService = new VolumesService(this.supabase)

    await Promise.all([
      this.update(id, { status: 'draft' }),
      chaptersService.restoreByNovelId(id),
      volumesService.restoreByNovelId(id),
    ])

    return this.getById(id)
  }

  async publish(id: string) {
    const novel = await this.getById(id)

    if (novel.chapter_count === 0) {
      const publishError = new Error('Cannot publish a novel without chapters') as Error & { statusCode: number, code: string }
      publishError.statusCode = 400
      publishError.code = 'CANNOT_PUBLISH'
      throw publishError
    }

    const { data, error } = await this.supabase
      .from('novels')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async unpublish(id: string) {
    return this.update(id, { status: 'draft' })
  }

  async getArchived() {
    const { data, error } = await this.supabase
      .from('novels')
      .select('*')
      .eq('status', 'archived')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async updateOrder(novels: Array<{ id: string, order_index: number }>) {
    const promises = novels.map(({ id, order_index }) =>
      this.supabase.from('novels').update({ order_index }).eq('id', id),
    )

    const results = await Promise.all(promises)
    const errors = results.filter(r => r.error)

    if (errors.length > 0) {
      const updateError = new Error('Failed to update novel order')
      Object.assign(updateError, {
        statusCode: 400,
        code: 'UPDATE_NOVEL_ORDER_FAILED',
      })
      throw updateError
    }
  }
}
