import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { z } from 'zod'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'

/**
 * update_chapter
 *
 * 更新章节元信息（标题、所属卷、排序）。**不**用于改正文——改正文请用 propose_edit 或 append_chapter。
 *
 * 返回完整 chapter 对象，前端直接 upsert 到 store。
 */
export const updateChapterTool: ToolBuilder = (ctx) => {
  return tool({
    description: [
      '更新章节的元信息：标题（title）、所属卷（volumeId）、排序（orderIndex）。',
      '不用此工具改正文——改正文用 propose_edit（diff 模式）或 append_chapter（追加）。',
      '至少传入 title / volumeId / orderIndex 之一；其余字段不传保持不变。',
    ].join('\n'),
    inputSchema: z.object({
      chapterId: z.string().describe('要更新的章节 id'),
      title: z.string().min(1).max(80).optional().describe('新标题；不传保持不变'),
      volumeId: z.string().nullable().optional().describe('新的所属卷 id；null 表示移到根；不传保持不变'),
      orderIndex: z.number().int().optional().describe('新的 order_index；不传保持不变'),
    }),
    execute: async ({ chapterId, title, volumeId, orderIndex }) => {
      const service = new ChaptersService(ctx.supabase)
      try {
        const updates: Record<string, unknown> = {}
        if (title !== undefined) updates.title = title
        if (volumeId !== undefined) updates.volume_id = volumeId
        if (orderIndex !== undefined) updates.order_index = orderIndex

        if (Object.keys(updates).length === 0) {
          return { ok: false, error: 'no fields to update', hint: '至少需要传入 title / volumeId / orderIndex 之一' }
        }

        const updated = await service.update(chapterId, updates as any)
        return {
          ok: true,
          chapter: updated,
          chapter_id: updated.id,
          title: updated.title,
          volume_id: updated.volume_id,
          order_index: updated.order_index,
        }
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : 'update_chapter failed',
          hint: '可能是网络超时或章节不存在；请稍后重试。',
        }
      }
    },
  })
}
