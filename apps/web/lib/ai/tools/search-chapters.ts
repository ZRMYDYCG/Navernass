import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { z } from 'zod'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'

/**
 * search_chapters
 *
 * 在当前小说所有章节中按关键词检索，返回匹配的片段（前后各 50 字上下文）。
 * 用于让 agent 在不加载全部章节的情况下定位相关内容（轻量 RAG）。
 */
export const searchChaptersTool: ToolBuilder = (ctx) => {
  return tool({
    description: '在当前小说的所有章节中按关键词检索，返回匹配片段及上下文。用于回答"XX 在哪一章出现过""之前怎么写的"等问题。',
    inputSchema: z.object({
      keyword: z.string().min(1).describe('检索关键词（人名、地名、台词片段等）'),
      limit: z.number().int().min(1).max(20).optional().describe('最多返回多少个匹配章节，默认 5'),
    }),
    execute: async ({ keyword, limit = 5 }) => {
      const service = new ChaptersService(ctx.supabase)
      const results = await service.search({ novelId: ctx.novelId, keyword })
      return results.slice(0, limit).map(r => ({
        chapter_id: r.chapter.id,
        chapter_title: r.chapter.title,
        match_count: r.matchCount,
        snippets: r.contentMatches.slice(0, 3).map(m => m.text),
      }))
    },
  })
}
