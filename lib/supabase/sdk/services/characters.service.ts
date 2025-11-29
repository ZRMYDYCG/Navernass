import { supabase } from '@/lib/supabase'

export class CharactersService {
  async getByNovelId(novelId: string) {
    const { data, error } = await supabase
      .from('novels')
      .select('characters')
      .eq('id', novelId)
      .single()

    if (error) throw error
    const characters = (data as { characters?: unknown }).characters
    if (!Array.isArray(characters)) return []
    return characters
  }

  async getById(id: string) {
    throw new Error('Not implemented')
  }

  async create() {
    throw new Error('Not implemented')
  }

  async update() {
    throw new Error('Not implemented')
  }

  async delete() {
    throw new Error('Not implemented')
  }
}
