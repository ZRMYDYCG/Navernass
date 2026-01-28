import type { SupabaseClient } from '@supabase/supabase-js'

export class RelationshipsService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async getByNovelId(novelId: string) {
    const { data, error } = await this.supabase
      .from('novels')
      .select('relationships')
      .eq('id', novelId)
      .single()

    if (error) throw error

    const relationships = (data as { relationships?: unknown }).relationships
    if (!Array.isArray(relationships)) return []
    return relationships
  }
}
