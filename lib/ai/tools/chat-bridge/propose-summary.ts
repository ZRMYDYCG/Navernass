import type { ToolBuilder } from '../../agents/types'
import { tool } from 'ai'
import { z } from 'zod'

/**
 * propose_summary — 把对话内容整理成结构化摘要
 *
 * 摘要本身不落库，前端展示卡片供用户复制或「导入到小说」作为序章/简介草稿。
 */
export const proposeSummaryTool: ToolBuilder = () => {
  return tool({
    description: [
      '当对话已经有较丰富的内容，用户希望把整段对话浓缩成可复用的摘要时，调用本工具。',
      '常见场景：用户说"帮我整理一下这段对话"/"做个摘要"/"给我一个能存下来的版本"。',
      '执行后展示 proposal 卡片，含复制按钮与"导入到小说"占位（后续扩展）。',
    ].join('\n'),
    inputSchema: z.object({
      title: z.string().describe('摘要标题'),
      content: z.string().describe('摘要正文（Markdown 格式）'),
    }),
    execute: async ({ title, content }) => {
      return {
        ok: true as const,
        kind: 'propose_summary' as const,
        payload: { title, content },
      }
    },
  })
}
