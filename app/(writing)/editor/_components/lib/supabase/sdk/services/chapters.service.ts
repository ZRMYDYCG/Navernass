import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateChapterDto, UpdateChapterDto } from '../types'

export class ChaptersService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * 获取小说的所有章节（不包含已删除的）
   */
  async getByNovelId(novelId: string) {
    const { data, error } = await this.supabase
      .from('chapters')
      .select('*')
      .eq('novel_id', novelId)
      .is('deleted_at', null)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * 获取小说的所有章节（包括已删除的，用于恢复）
   */
  async getAllByNovelId(novelId: string) {
    const { data, error } = await this.supabase
      .from('chapters')
      .select('*')
      .eq('novel_id', novelId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * 获取单个章节
   */
  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('chapters')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        const notFoundError = new Error('Chapter not found')
        Object.assign(notFoundError, {
          statusCode: 404,
          code: 'CHAPTER_NOT_FOUND',
        })
        throw notFoundError
      }
      throw error
    }

    return data
  }

  /**
   * 更新小说的章节数和字数统计
   */
  private async updateNovelStats(novelId: string) {
    const { data: chapters, error } = await this.supabase
      .from('chapters')
      .select('word_count')
      .eq('novel_id', novelId)
      .is('deleted_at', null)

    if (error) throw error

    const chapterCount = chapters?.length || 0
    const wordCount = chapters?.reduce((sum, chapter) => sum + (chapter.word_count || 0), 0) || 0

    const { error: updateError } = await this.supabase
      .from('novels')
      .update({
        chapter_count: chapterCount,
        word_count: wordCount,
      })
      .eq('id', novelId)

    if (updateError) throw updateError
  }

  /**
   * 创建章节
   */
  async create(chapterData: CreateChapterDto) {
    const { data: { user } } = await this.supabase.auth.getUser()

    const wordCount = chapterData.content
      ? chapterData.content.replace(/<[^>]*>/g, '').length
      : 0

    const insertData: Record<string, unknown> = {
      user_id: user?.id,
      novel_id: chapterData.novel_id,
      title: chapterData.title,
      content: chapterData.content || '',
      order_index: chapterData.order_index,
      word_count: wordCount,
      status: 'draft',
    }

    if (chapterData.volume_id !== undefined) {
      insertData.volume_id = chapterData.volume_id || null
    }

    const { data, error } = await this.supabase
      .from('chapters')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

    await this.updateNovelStats(chapterData.novel_id)

    return data
  }

  /**
   * 更新章节
   */
  async update(id: string, updates: Partial<UpdateChapterDto>) {
    const chapter = await this.getById(id)

    const updateData: Record<string, unknown> = { ...updates }

    if (updates.content !== undefined) {
      updateData.word_count = updates.content.replace(/<[^>]*>/g, '').length
    }

    const { data, error } = await this.supabase
      .from('chapters')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ 数据库更新失败:', error)
      throw error
    }

    if (updates.content !== undefined) {
      await this.updateNovelStats(chapter.novel_id)
    }

    return data
  }

  /**
   * 删除章节（软删除）
   */
  async delete(id: string) {
    const chapter = await this.getById(id)

    const { error } = await this.supabase
      .from('chapters')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    await this.updateNovelStats(chapter.novel_id)
  }

  /**
   * 归档小说的所有章节（软删除）
   */
  async archiveByNovelId(novelId: string) {
    const { error } = await this.supabase
      .from('chapters')
      .update({ deleted_at: new Date().toISOString() })
      .eq('novel_id', novelId)
      .is('deleted_at', null)

    if (error) throw error
  }

  /**
   * 恢复小说的所有章节
   */
  async restoreByNovelId(novelId: string) {
    const { error } = await this.supabase
      .from('chapters')
      .update({ deleted_at: null })
      .eq('novel_id', novelId)
      .not('deleted_at', 'is', null)

    if (error) throw error
  }

  /**
   * 永久删除小说的所有章节
   */
  async deleteByNovelId(novelId: string) {
    const { error } = await this.supabase
      .from('chapters')
      .delete()
      .eq('novel_id', novelId)

    if (error) throw error
  }

  /**
   * 批量更新章节顺序
   */
  async updateOrder(chapters: Array<{ id: string, order_index: number }>) {
    const promises = chapters.map(({ id, order_index }) =>
      this.supabase.from('chapters').update({ order_index }).eq('id', id),
    )

    const results = await Promise.all(promises)
    const errors = results.filter(r => r.error)

    if (errors.length > 0) {
      const updateError = new Error('Failed to update chapter order')
      Object.assign(updateError, {
        statusCode: 400,
        code: 'UPDATE_ORDER_FAILED',
      })
      throw updateError
    }
  }

  /**
   * 发布章节
   */
  async publish(id: string) {
    return this.update(id, { status: 'published' })
  }

  /**
   * 取消发布章节
   */
  async unpublish(id: string) {
    return this.update(id, { status: 'draft' })
  }

  /**
   * 搜索章节
   */
  async search(params: {
    novelId: string
    keyword: string
    volumeId?: string | null // 检索的卷，null 表示 root，undefined 表示不限制
    excludeVolumeId?: string | null // 跳过检索的卷，null 表示 root，undefined 表示不跳过
  }) {
    const { novelId, keyword, volumeId, excludeVolumeId } = params

    // 构建查询
    let query = this.supabase
      .from('chapters')
      .select('*')
      .eq('novel_id', novelId)

    // 如果指定了 volumeId，只搜索该卷的章节
    // volumeId === null 表示只搜索 root（volume_id 为 null）的章节
    // volumeId === undefined 表示不限制卷
    if (volumeId !== undefined) {
      if (volumeId === null) {
        query = query.is('volume_id', null)
      } else {
        query = query.eq('volume_id', volumeId)
      }
    }

    // 如果指定了 excludeVolumeId，排除该卷的章节
    if (excludeVolumeId !== undefined) {
      if (excludeVolumeId === null) {
        query = query.not('volume_id', 'is', null)
      } else {
        query = query.neq('volume_id', excludeVolumeId)
      }
    }

    // 执行查询
    const { data, error } = await query.order('order_index', { ascending: true })

    if (error) throw error

    // 在内存中搜索内容（因为 Supabase 的全文搜索需要配置）
    const results = (data || []).map((chapter) => {
      const content = chapter.content || ''
      const title = chapter.title || ''

      // 移除 HTML 标签进行搜索
      const plainContent = content.replace(/<[^>]*>/g, '')
      const plainTitle = title.replace(/<[^>]*>/g, '')

      // 搜索关键字（不区分大小写）
      const keywordLower = keyword.toLowerCase()
      const contentLower = plainContent.toLowerCase()
      const titleLower = plainTitle.toLowerCase()

      // 查找所有匹配位置
      const contentMatches: Array<{ start: number, end: number, text: string }> = []
      const titleMatches: Array<{ start: number, end: number, text: string }> = []

      // 在标题中搜索
      let titleIndex = titleLower.indexOf(keywordLower)
      while (titleIndex !== -1) {
        titleMatches.push({
          start: titleIndex,
          end: titleIndex + keyword.length,
          text: title.substring(titleIndex, titleIndex + keyword.length),
        })
        titleIndex = titleLower.indexOf(keywordLower, titleIndex + 1)
      }

      // 在内容中搜索（限制前 10 个匹配）
      let contentIndex = contentLower.indexOf(keywordLower)
      let matchCount = 0
      while (contentIndex !== -1 && matchCount < 10) {
        // 获取匹配位置前后的上下文（各 50 个字符）
        const contextStart = Math.max(0, contentIndex - 50)
        const contextEnd = Math.min(plainContent.length, contentIndex + keyword.length + 50)
        const contextText = plainContent.substring(contextStart, contextEnd)

        contentMatches.push({
          start: contentIndex,
          end: contentIndex + keyword.length,
          text: contextText,
        })
        matchCount++
        contentIndex = contentLower.indexOf(keywordLower, contentIndex + 1)
      }

      return {
        chapter,
        titleMatches,
        contentMatches,
        matchCount: titleMatches.length + contentMatches.length,
      }
    }).filter(result => result.matchCount > 0) // 只返回有匹配的章节

    return results
  }
}
