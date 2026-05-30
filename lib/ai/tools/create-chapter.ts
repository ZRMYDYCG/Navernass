import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { z } from 'zod'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'

/**
 * create_chapter (★ 自治创建章节)
 *
 * 在指定卷下创建新章节。order_index 自动算（同卷下追加到末尾）。
 * 可选 initialContent：直接把首段写进去（agent 可以用来生成开篇）。
 *
 * 不归属任何卷时传 volumeId = null（落到 root 章节）。
 */
export const createChapterTool: ToolBuilder = (ctx) => {
  return tool({
    description: [
      '在当前小说下创建一个新章节。',
      '可指定 volumeId 把章节挂到具体卷下；不传或传 null 表示根章节。',
      'order_index 自动计算（同卷下追加到末尾）。',
      '可选传入 initialContent 作为初始正文（HTML 字符串，例如 <h1>章节标题</h1><p>开篇文字</p>）。',
    ].join('\n'),
    inputSchema: z.object({
      title: z.string().min(1).max(80).describe('章节标题'),
      volumeId: z.string().nullable().optional().describe('归属的卷 id；null 或不传表示根章节'),
      initialContent: z.string().optional().describe('初始正文 HTML，可选'),
    }),
    execute: async ({ title, volumeId, initialContent }) => {
      const service = new ChaptersService(ctx.supabase)
      try {
        const allChapters = await service.getByNovelId(ctx.novelId)

        const sameScope = allChapters.filter((ch: any) => {
          if (volumeId == null) return ch.volume_id == null
          return ch.volume_id === volumeId
        })
        const nextOrder = sameScope.length > 0
          ? Math.max(...sameScope.map((c: any) => c.order_index || 0)) + 1
          : 0

        const created = await service.create({
          novel_id: ctx.novelId,
          title,
          content: initialContent ?? `<h1>${title}</h1>`,
          order_index: nextOrder,
          volume_id: volumeId ?? null,
        } as any)

        return {
          ok: true,
          chapter: created,
          chapter_id: created.id,
          title: created.title,
          volume_id: created.volume_id,
          order_index: created.order_index,
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'create_chapter failed'
        return {
          ok: false,
          error: message,
          hint: '可能是网络超时；请稍后重试。',
        }
      }
    },
  })
}
