import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { z } from 'zod'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'

/**
 * list_chapters
 *
 * 列出当前小说所有章节（按 order_index 排序）。可选按 volumeId 过滤。
 * 返回精简元信息（不含完整正文），让 agent 能定位重复/同名章节、判断要删哪个。
 */
export const listChaptersTool: ToolBuilder = (ctx) => {
  return tool({
    description: '列出当前小说的所有章节元信息（不含正文）。可选按 volumeId 过滤同一卷下的章节。需要查重、定位、删除时调用。',
    inputSchema: z.object({
      volumeId: z.string().nullable().optional().describe('可选；只列出指定卷下的章节。null 表示根章节。'),
    }),
    execute: async ({ volumeId }) => {
      const service = new ChaptersService(ctx.supabase)
      try {
        const all = await service.getByNovelId(ctx.novelId)
        const filtered = volumeId === undefined
          ? all
          : all.filter((c: any) => (volumeId == null ? c.volume_id == null : c.volume_id === volumeId))
        return filtered.map((c: any) => ({
          id: c.id,
          title: c.title,
          volume_id: c.volume_id,
          order_index: c.order_index,
          word_count: c.word_count,
          status: c.status,
          updated_at: c.updated_at,
        }))
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : 'list_chapters failed',
        }
      }
    },
  })
}
