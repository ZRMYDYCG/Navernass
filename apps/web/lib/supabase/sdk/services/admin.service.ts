import type { SupabaseClient } from '@supabase/supabase-js'
import type { AdminResourceConfig } from '@/lib/admin/resources'
import type { CreateNewsDto, UpdateNewsDto } from '../types'

export class AdminService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  private async countTable(table: string, softDelete = false) {
    let query = this.supabase.from(table).select('*', { count: 'exact', head: true })
    if (softDelete) {
      query = query.is('deleted_at', null)
    }
    const { count, error } = await query
    if (error) throw error
    return count || 0
  }

  async getStats() {
    const [
      users,
      profiles,
      novels,
      chapters,
      volumes,
      conversations,
      messages,
      novelConversations,
      novelMessages,
      surveys,
      news,
      messageWall,
      writerTodos,
      planFiles,
      worldbook,
      outlines,
      timelineEvents,
      userSettings,
    ] = await Promise.all([
      this.countTable('profiles'),
      this.countTable('profiles'),
      this.countTable('novels'),
      this.countTable('chapters', true),
      this.countTable('volumes', true),
      this.countTable('conversations'),
      this.countTable('messages'),
      this.countTable('novel_conversations'),
      this.countTable('novel_messages'),
      this.countTable('surveys'),
      this.countTable('news'),
      this.countTable('message_wall_entries'),
      this.countTable('writer_todos'),
      this.countTable('plan_files', true),
      this.countTable('worldbook_entries', true),
      this.countTable('outlines', true),
      this.countTable('character_timeline_events', true),
      this.countTable('user_settings'),
    ])

    const { data: authUsers, error: authError } = await this.supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    })
    if (authError) throw authError

    return {
      users: authUsers.total ?? users,
      profiles,
      novels,
      chapters,
      volumes,
      conversations,
      messages,
      novelConversations,
      novelMessages,
      surveys,
      news,
      messageWall,
      writerTodos,
      planFiles,
      worldbook,
      outlines,
      timelineEvents,
      userSettings,
    }
  }

  async listTable(config: AdminResourceConfig, page = 1, pageSize = 20) {
    if (!config.table) {
      throw new Error('Table is required')
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const orderBy = config.orderBy || 'created_at'

    let query = this.supabase
      .from(config.table)
      .select('*', { count: 'exact' })
      .order(orderBy, { ascending: false })
      .range(from, to)

    if (config.softDelete) {
      query = query.is('deleted_at', null)
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

  async listUsers(page = 1, pageSize = 20) {
    const { data, error } = await this.supabase.auth.admin.listUsers({
      page,
      perPage: pageSize,
    })

    if (error) throw error

    const userIds = data.users.map(user => user.id)
    const { data: profiles, error: profilesError } = userIds.length
      ? await this.supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, role, is_protected, created_at, updated_at')
          .in('id', userIds)
      : { data: [], error: null }

    if (profilesError) throw profilesError

    const profileMap = new Map((profiles || []).map(profile => [profile.id, profile]))

    return {
      data: data.users.map((user) => {
        const profile = profileMap.get(user.id)
        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          username: profile?.username ?? null,
          full_name: profile?.full_name ?? null,
          avatar_url: profile?.avatar_url ?? null,
          role: profile?.role ?? 'user',
          is_protected: profile?.is_protected ?? false,
          profile_created_at: profile?.created_at ?? null,
        }
      }),
      total: data.total ?? data.users.length,
      page,
      pageSize,
    }
  }

  async listNovels(page = 1, pageSize = 20, status?: string) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = this.supabase
      .from('novels')
      .select('id, user_id, title, description, status, word_count, chapter_count, category, created_at, updated_at, published_at', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(from, to)

    if (status) {
      query = query.eq('status', status)
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

  async deleteNovel(id: string) {
    const { data: novel, error: novelError } = await this.supabase
      .from('novels')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (novelError) throw novelError
    if (!novel) {
      const notFoundError = new Error('Novel not found') as Error & { statusCode: number, code: string }
      notFoundError.statusCode = 404
      notFoundError.code = 'NOVEL_NOT_FOUND'
      throw notFoundError
    }

    await this.supabase.from('novel_messages').delete().eq('novel_id', id)
    await this.supabase.from('novel_conversations').delete().eq('novel_id', id)
    await this.supabase.from('character_timeline_events').delete().eq('novel_id', id)
    await this.supabase.from('plan_files').delete().eq('novel_id', id)
    await this.supabase.from('worldbook_entries').delete().eq('novel_id', id)
    await this.supabase.from('outlines').delete().eq('novel_id', id)
    await this.supabase.from('chapters').delete().eq('novel_id', id)
    await this.supabase.from('volumes').delete().eq('novel_id', id)

    const { error } = await this.supabase.from('novels').delete().eq('id', id)
    if (error) throw error
  }

  async listSurveys(page = 1, pageSize = 20) {
    return this.listTable({
      id: 'surveys',
      table: 'surveys',
      labelKey: '',
      descriptionKey: '',
      orderBy: 'created_at',
    }, page, pageSize)
  }

  async listNews(page = 1, pageSize = 20, status?: string) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = this.supabase
      .from('news')
      .select('id, type, title, status, priority, read_count, author, created_at, updated_at', { count: 'exact' })
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status) {
      query = query.eq('status', status)
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

  async createNews(newsData: CreateNewsDto) {
    const { data, error } = await this.supabase
      .from('news')
      .insert({
        type: newsData.type,
        title: newsData.title,
        content: newsData.content,
        image: newsData.image,
        link: newsData.link,
        author: newsData.author,
        priority: newsData.priority || 0,
        status: 'published',
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateNews(id: string, updates: Partial<UpdateNewsDto>) {
    const { data, error } = await this.supabase
      .from('news')
      .update({
        type: updates.type,
        title: updates.title,
        content: updates.content,
        image: updates.image,
        link: updates.link,
        author: updates.author,
        status: updates.status,
        priority: updates.priority,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteNews(id: string) {
    const { error } = await this.supabase.from('news').delete().eq('id', id)
    if (error) throw error
  }

  async deleteUser(userId: string) {
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('id, is_protected, role')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) throw profileError

    if (profile?.is_protected || profile?.role === 'super_admin') {
      const forbiddenError = new Error('Cannot delete protected super admin') as Error & { statusCode: number, code: string }
      forbiddenError.statusCode = 403
      forbiddenError.code = 'PROTECTED_USER'
      throw forbiddenError
    }

    const { error } = await this.supabase.auth.admin.deleteUser(userId)
    if (error) throw error
  }

  async deleteTableRow(table: string, id: string) {
    const { error } = await this.supabase.from(table).delete().eq('id', id)
    if (error) throw error
  }
}
