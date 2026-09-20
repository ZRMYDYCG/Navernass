import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateCharacterTimelineEventDto, UpdateCharacterTimelineEventDto } from '../types'

export class CharacterTimelineEventsService {
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

  /** 列出某角色的全部事件（按 timeline_position 排序） */
  async getByCharacterId(characterId: string) {
    const userId = await this.requireUserId()
    const { data, error } = await this.supabase
      .from('character_timeline_events')
      .select('*')
      .eq('character_id', characterId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('timeline_position', { ascending: true })
    if (error) throw error
    return data || []
  }

  /** 列出小说全部事件（角色剧本概览/AI 总览用） */
  async getByNovelId(novelId: string) {
    const userId = await this.requireUserId()
    const { data, error } = await this.supabase
      .from('character_timeline_events')
      .select('*')
      .eq('novel_id', novelId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('timeline_position', { ascending: true })
    if (error) throw error
    return data || []
  }

  async getById(id: string) {
    const userId = await this.requireUserId()
    const { data, error } = await this.supabase
      .from('character_timeline_events')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    if (error) {
      if (error.code === 'PGRST116') {
        const e = new Error('Timeline event not found') as Error & { statusCode: number, code: string }
        e.statusCode = 404
        e.code = 'TIMELINE_EVENT_NOT_FOUND'
        throw e
      }
      throw error
    }
    return data
  }

  async create(dto: CreateCharacterTimelineEventDto) {
    const userId = await this.requireUserId()
    let pos = dto.timeline_position
    if (pos === undefined) {
      const { data: existing } = await this.supabase
        .from('character_timeline_events')
        .select('timeline_position')
        .eq('character_id', dto.character_id)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('timeline_position', { ascending: false })
        .limit(1)
        .maybeSingle()
      pos = (existing?.timeline_position ?? -1) + 1
    }
    const { data, error } = await this.supabase
      .from('character_timeline_events')
      .insert({
        user_id: userId,
        novel_id: dto.novel_id,
        character_id: dto.character_id,
        chapter_id: dto.chapter_id ?? null,
        event_type: dto.event_type || 'other',
        title: dto.title,
        description: dto.description || '',
        timeline_position: pos,
        occurred_at_label: dto.occurred_at_label ?? null,
      })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async update(id: string, updates: UpdateCharacterTimelineEventDto) {
    await this.getById(id)
    const { data, error } = await this.supabase
      .from('character_timeline_events')
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
      .from('character_timeline_events')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  }
}
