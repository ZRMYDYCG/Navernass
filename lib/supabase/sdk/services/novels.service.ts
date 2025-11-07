import type {
  CreateNovelDto,
  PaginationParams,
  UpdateNovelDto,
} from '../types'
import { supabase } from '@/lib/supabase'

export class NovelsService {
  /**
   * 获取小说列表
   */
  async getList(params?: PaginationParams & { status?: string }) {
    const page = params?.page || 1
    const pageSize = params?.pageSize || 10
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('novels')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (params?.status) {
      query = query.eq('status', params.status)
    } else {
      // 默认排除已归档的小说
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
    const { data, error } = await supabase
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
    // 业务逻辑验证
    if (!novelData.title || novelData.title.trim().length === 0) {
      const validationError = new Error('Title is required') as Error & { statusCode: number, code: string }
      validationError.statusCode = 400
      validationError.code = 'INVALID_TITLE'
      throw validationError
    }

    const { data, error } = await supabase
      .from('novels')
      .insert({
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

  /**
   * 更新小说
   */
  async update(id: string, updates: Partial<UpdateNovelDto>) {
    // 先检查是否存在
    await this.getById(id)

    const { data, error } = await supabase
      .from('novels')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * 删除小说（硬删除）
   */
  async delete(id: string) {
    await this.getById(id)

    const { error } = await supabase.from('novels').delete().eq('id', id)

    if (error) throw error
  }

  /**
   * 归档小说
   */
  async archive(id: string) {
    return this.update(id, { status: 'archived' })
  }

  /**
   * 恢复小说
   */
  async restore(id: string) {
    return this.update(id, { status: 'draft' })
  }

  /**
   * 发布小说
   */
  async publish(id: string) {
    const novel = await this.getById(id)

    // 业务逻辑：检查是否可以发布
    if (novel.chapter_count === 0) {
      const publishError = new Error('Cannot publish a novel without chapters') as Error & { statusCode: number, code: string }
      publishError.statusCode = 400
      publishError.code = 'CANNOT_PUBLISH'
      throw publishError
    }

    // 直接更新数据库（包含 published_at 字段）
    const { data, error } = await supabase
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

  /**
   * 取消发布
   */
  async unpublish(id: string) {
    return this.update(id, { status: 'draft' })
  }

  /**
   * 获取归档的小说
   */
  async getArchived() {
    const { data, error } = await supabase
      .from('novels')
      .select('*')
      .eq('status', 'archived')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}
