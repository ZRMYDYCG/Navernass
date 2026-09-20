import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { z } from 'zod'
import { ChaptersService } from '@/lib/supabase/sdk/services/chapters.service'

/**
 * append_chapter (★ 自治续写)
 *
 * 在已存在章节末尾追加内容。区别：
 *   - propose_edit：diff 模式，需要用户接受/拒绝
 *   - append_chapter：直接落库（适合"续写"场景，AI 生成的内容是新增的，不冲突）
 *
 * agent 提供的 contentToAppend 可以是 markdown 或 HTML 片段。
 * 后端简单处理：如果是纯文本/markdown，自动用 <p> 包裹。
 *
 * 前端通过事件感知，把追加的部分以 SuggestionAdd（绿色）形式注入编辑器，
 * 这样用户仍有「保留/撤销」的视觉反馈。
 */
export const appendChapterTool: ToolBuilder = (ctx) => {
  return tool({
    description: [
      '在指定章节末尾追加新内容（用于"续写"场景）。',
      '与 propose_edit 不同：本工具不是修改现有文字，而是新增内容到末尾。',
      'contentToAppend 可以是纯文本或简单 HTML；纯文本会被自动用 <p> 包裹。',
      '工具会立即落库，前端会以"待确认"标记呈现新内容，方便用户接受或回滚。',
    ].join('\n'),
    inputSchema: z.object({
      chapterId: z.string().describe('要追加的章节 id'),
      contentToAppend: z.string().min(1).describe('要追加的内容；纯文本或 HTML 片段'),
      reasoning: z.string().describe('简短说明这段续写的意图（一句话）'),
    }),
    execute: async ({ chapterId, contentToAppend, reasoning }) => {
      const service = new ChaptersService(ctx.supabase)
      try {
        const chapter = await service.getById(chapterId)

        const isHtml = /<[a-z][\s\S]*>/i.test(contentToAppend)
        const fragmentHtml = isHtml
          ? contentToAppend
          : contentToAppend
              .split(/\n{2,}/)
              .filter(p => p.trim())
              .map(p => `<p>${escapeHtml(p)}</p>`)
              .join('')

        const newContent = `${chapter.content || ''}${fragmentHtml}`
        const updated = await service.update(chapterId, { content: newContent })

        return {
          ok: true,
          chapter: updated,
          chapter_id: chapter.id,
          chapter_title: chapter.title,
          appended_html: fragmentHtml,
          new_word_count: updated.word_count,
          reasoning,
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'append_chapter failed'
        return {
          ok: false,
          error: message,
          hint: '可能是网络超时或章节不存在；请稍后重试或确认 chapterId 是否正确。',
          reasoning,
        }
      }
    },
  })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
