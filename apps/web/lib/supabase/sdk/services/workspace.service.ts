import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CalendarDayItem,
  CharacterMapItem,
  GenreRadarItem,
  NovelStatusItem,
  WordCountTrendItem,
  WorkspaceStats,
} from '../types'

export class WorkspaceService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  private async getAuthenticatedUserId() {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser()
    if (error || !user) {
      const err = new Error('Unauthorized') as Error & { statusCode: number, code: string }
      err.statusCode = 401
      err.code = 'UNAUTHORIZED'
      throw err
    }
    return user.id
  }

  async getStats(): Promise<WorkspaceStats> {
    const userId = await this.getAuthenticatedUserId()

    // Parallel queries
    const [novelsResult, chaptersResult, conversationsResult, novelConversationsResult]
      = await Promise.all([
        this.supabase.from('novels').select('*').eq('user_id', userId),
        this.supabase
          .from('chapters')
          .select('word_count, updated_at, status')
          .eq('user_id', userId)
          .is('deleted_at', null),
        this.supabase
          .from('conversations')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        this.supabase
          .from('novel_conversations')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
      ])

    if (novelsResult.error) throw novelsResult.error
    if (chaptersResult.error) throw chaptersResult.error

    const novels = novelsResult.data || []
    const chapters = chaptersResult.data || []
    const conversationCount
      = (conversationsResult.count || 0) + (novelConversationsResult.count || 0)

    // ── Summary ──────────────────────────────────────────────
    const summary = {
      novelCount: novels.filter(n => n.status !== 'archived').length,
      totalWordCount: novels.reduce((sum: number, n) => sum + (n.word_count || 0), 0),
      totalChapterCount: novels.reduce((sum: number, n) => sum + (n.chapter_count || 0), 0),
      conversationCount,
    }

    // ── Word count trend (last 7 months) ─────────────────────
    const now = new Date()
    const wordCountTrend: WordCountTrendItem[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextD = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      const label = `${d.getMonth() + 1}月`
      const wordCount = chapters
        .filter((c) => {
          const updated = new Date(c.updated_at)
          return updated >= d && updated < nextD
        })
        .reduce((sum: number, c) => sum + (c.word_count || 0), 0)
      wordCountTrend.push({ month: label, wordCount })
    }

    // ── Novel status distribution ────────────────────────────
    const statusLabels: Record<string, string> = {
      draft: '草稿',
      published: '连载中',
      archived: '已完结',
    }
    const statusCounts: Record<string, number> = { draft: 0, published: 0, archived: 0 }
    novels.forEach((n) => {
      if (n.status in statusCounts) statusCounts[n.status]++
    })
    const novelStatusData: NovelStatusItem[] = Object.entries(statusCounts).map(
      ([status, value]) => ({ status, label: statusLabels[status] || status, value }),
    )

    // ── Character map (top 6 novels by character count) ──────
    const characterMapData: CharacterMapItem[] = novels
      .map(n => ({
        title: n.title,
        characters: Array.isArray(n.characters) ? n.characters.length : 0,
        relationships: Array.isArray(n.relationships) ? n.relationships.length : 0,
      }))
      .sort((a, b) => b.characters - a.characters)
      .slice(0, 6)

    // ── Genre radar ──────────────────────────────────────────
    const genreMap: Record<string, GenreRadarItem> = {}
    novels.forEach((n) => {
      const tagList: string[] = Array.isArray(n.tags) && n.tags.length > 0 ? n.tags : ['其他']
      tagList.forEach((tag) => {
        if (!genreMap[tag]) {
          genreMap[tag] = { category: tag, draft: 0, published: 0, archived: 0 }
        }
        if (n.status === 'draft') genreMap[tag].draft++
        else if (n.status === 'published') genreMap[tag].published++
        else if (n.status === 'archived') genreMap[tag].archived++
      })
    })
    const genreRadarData: GenreRadarItem[] = Object.values(genreMap).slice(0, 6)

    // ── Writing calendar (last 84 days) ──────────────────────
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const start = new Date(today)
    start.setDate(today.getDate() - 83)
    start.setHours(0, 0, 0, 0)

    const dayCountMap: Record<string, number> = {}
    chapters.forEach((c) => {
      const d = new Date(c.updated_at)
      if (d >= start && d <= today) {
        const key = d.toISOString().slice(0, 10)
        dayCountMap[key] = (dayCountMap[key] || 0) + 1
      }
    })
    const calendarData: CalendarDayItem[] = []
    for (let i = 0; i < 84; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      calendarData.push({ date: key, count: dayCountMap[key] || 0 })
    }

    return {
      summary,
      wordCountTrend,
      novelStatusData,
      characterMapData,
      genreRadarData,
      calendarData,
    }
  }
}
