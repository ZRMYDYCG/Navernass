import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { z } from 'zod'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'

/**
 * propose_edit (★ 编辑器手术刀)
 *
 * 关键设计：本工具的 execute 不会修改章节内容。它仅校验 chapterId 合法性，
 * 然后把结构化建议（原文片段 + 建议替换）原样返回。
 *
 * 真正的"应用 diff"由前端在收到 tool result part 后接管：
 *   - 在 Tiptap 编辑器中调用 applySuggestionDiff 渲染绿/红标记
 *   - 用户点击「接受」触发 acceptSuggestions 落库（走章节保存流程）
 *   - 用户点击「拒绝」触发 rejectSuggestions 回滚
 *
 * 这样保证了：
 *   1. AI 永远不能绕过用户直接改稿
 *   2. diff 状态由前端编辑器持有，与 Tiptap 已有的 suggestion-track 扩展无缝衔接
 */
export const proposeEditTool: ToolBuilder = (ctx) => {
  return tool({
    description: [
      '向用户提议对某章节的文本修改。',
      '调用前必须先用 read_chapter 拿到原文，然后从原文中精确摘出要替换的片段（original_text）和建议的新文本（suggested_text）。',
      'original_text 必须与章节中的纯文本片段**逐字一致**，否则前端无法定位。',
      'suggested_text 可以是空字符串（表示删除）。',
      '工具不会立即生效——会以 diff 形式呈现给用户审阅。',
    ].join('\n'),
    inputSchema: z.object({
      chapterId: z.string().describe('要修改的章节 id'),
      originalText: z.string().min(1).describe('章节中要被替换的原始片段（必须与原文逐字一致）'),
      suggestedText: z.string().describe('建议替换为的新文本（可为空表示删除）'),
      reasoning: z.string().describe('修改理由，一句话说明为什么这样改'),
    }),
    execute: async ({ chapterId, originalText, suggestedText, reasoning }) => {
      const service = new ChaptersService(ctx.supabase)
      const chapter = await service.getById(chapterId)
      const plainContent = (chapter.content || '').replace(/<[^>]*>/g, '')
      const found = plainContent.indexOf(originalText)
      if (found < 0) {
        return {
          ok: false,
          error: 'original_text not found in chapter',
          hint: '请确保 originalText 与章节正文逐字一致；先用 read_chapter 拿到 plain_content。',
        }
      }
      return {
        ok: true,
        chapter_id: chapter.id,
        chapter_title: chapter.title,
        original_text: originalText,
        suggested_text: suggestedText,
        reasoning,
        offset: found,
      }
    },
  })
}
