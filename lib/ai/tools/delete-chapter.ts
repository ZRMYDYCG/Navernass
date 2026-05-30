import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { z } from 'zod'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'

/**
 * delete_chapter (软删除)
 *
 * ChaptersService.delete 走的是软删除（写 deleted_at），可以从工作区"已删除"恢复。
 * 高破坏性操作：要求 agent 在调用前用 list_chapters 确认 id 正确（特别是查重场景）。
 *
 * 返回的对象用于前端 store 的 removeChapter 同步。
 */
export const deleteChapterTool: ToolBuilder = (ctx) => {
  return tool({
    description: [
      '软删除指定章节（写入 deleted_at，可恢复）。',
      '高破坏性：调用前请用 list_chapters 确认要删的 chapterId。',
      '同名章节有多个时，先用 list_chapters 拿到完整列表让用户判断要删哪个，再调用本工具。',
    ].join('\n'),
    inputSchema: z.object({
      chapterId: z.string().describe('要删除的章节 id'),
      reason: z.string().describe('删除原因（一句话；用于审计与展示给用户）'),
    }),
    execute: async ({ chapterId, reason }) => {
      const service = new ChaptersService(ctx.supabase)
      try {
        const before = await service.getById(chapterId)
        await service.delete(chapterId)
        return {
          ok: true,
          chapter_id: chapterId,
          chapter_title: before.title,
          reason,
        }
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : 'delete_chapter failed',
          hint: '可能是章节不存在或网络超时。',
        }
      }
    },
  })
}
