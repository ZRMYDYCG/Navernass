import type { ToolBuilder } from '../agents/types'
import { tool } from 'ai'
import { z } from 'zod'

const fieldSchema = z.object({
  id: z.string().describe('字段唯一标识，如 genre / protagonist / background'),
  label: z.string().describe('展示给用户的字段标签'),
  type: z.enum(['text', 'textarea', 'select', 'radio']).describe('字段类型'),
  placeholder: z.string().optional().describe('占位提示'),
  required: z.boolean().optional().default(true),
  options: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional()
    .describe('select / radio 类型的选项列表'),
})

/**
 * ask_user — 向用户抛出结构化表单
 *
 * execute 不做任何副作用，仅校验并回传表单 schema。
 * 前端在收到 tool part 后渲染可交互表单；用户提交后以结构化文本继续对话。
 */
export const askUserTool: ToolBuilder = () => {
  return tool({
    description: [
      '向用户展示结构化表单以收集多项信息。',
      '适用场景：开篇章节需要了解类型/主角/背景/伏笔、创作前需确认多个选项、意图模糊但有有限选项时。',
      '不要用纯文本编号提问代替本工具——当需要 2 项及以上结构化输入时优先调用 ask_user。',
      'fields 每项应对应一个明确问题；select/radio 必须提供 options。',
    ].join('\n'),
    inputSchema: z.object({
      title: z.string().optional().describe('表单标题，如「第一章创作信息」'),
      description: z.string().optional().describe('引导说明，简短解释为何需要这些信息'),
      fields: z.array(fieldSchema).min(1).max(8).describe('表单字段列表，按展示顺序排列'),
    }),
    execute: async ({ title, description, fields }) => {
      for (const field of fields) {
        if ((field.type === 'select' || field.type === 'radio') && (!field.options || field.options.length === 0)) {
          return {
            ok: false as const,
            error: `字段「${field.label}」为 ${field.type} 类型，必须提供 options`,
          }
        }
      }
      return {
        ok: true as const,
        title,
        description,
        fields,
      }
    },
  })
}
