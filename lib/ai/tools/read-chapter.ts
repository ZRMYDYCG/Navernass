import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { z } from 'zod'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'

/**
 * read_chapter
 *
 * 读取章节正文（去除 HTML 标签的纯文本版本，避免污染 LLM 上下文）。
 * 返回的 plain_content 才是模型应当推理的内容，content 字段保留原始 HTML
 * 仅供必要时回写。
 */
export const readChapterTool: ToolBuilder = (ctx) => {
  return tool({
    description: '读取小说指定章节的正文内容。当用户要求修改/参考某章节时，必须先调用此工具拿到原文。',
    inputSchema: z.object({
      chapterId: z.string().describe('章节 id（uuid）'),
    }),
    execute: async ({ chapterId }) => {
      const service = new ChaptersService(ctx.supabase)
      const chapter = await service.getById(chapterId)
      const plainContent = (chapter.content || '').replace(/<[^>]*>/g, '')
      return {
        id: chapter.id,
        title: chapter.title,
        plain_content: plainContent,
        word_count: chapter.word_count,
      }
    },
  })
}
