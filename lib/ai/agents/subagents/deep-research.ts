import type { ToolContext } from '../types'
import { z } from 'zod'
import { createStreamingSubagentTool } from './create-streaming-subagent-tool'
import type { StreamingSubagentToolConfig } from './run-subagent-stream'
import { SUBAGENT_PREFETCH_SYSTEM_HINT } from './subagent-prefetch'
import { SUBAGENT_RESEARCH_SUMMARY_PROMPT } from './subagent-summary-schema'

export const DEEP_RESEARCH_TOOL_NAMES = [
  'read_chapter',
  'search_chapters',
  'list_volumes',
  'list_chapters',
  'list_worldbook_entries',
  'read_worldbook_entry',
  'list_outlines',
  'list_plan_files',
  'read_plan_file',
  'list_characters',
  'list_character_events',
] as const

const RESEARCH_SYSTEM_PROMPT = `你是小说调研子助手，由主写作 Agent 委派任务。
职责：大量阅读章节、设定、大纲与 Plan 文件，整理与任务相关的要点。

【规则】
- 只使用只读工具，不要尝试创建或修改任何数据
- 摘要将返回给主 Agent，务必信息密度高、可直接用于续写或改稿决策

${SUBAGENT_PREFETCH_SYSTEM_HINT}

${SUBAGENT_RESEARCH_SUMMARY_PROMPT}`

export const deepResearchInputSchema = z.object({
  task: z
    .string()
    .describe('调研任务说明，例如：核对第三卷主角与「雾港」设定是否矛盾'),
})

export type DeepResearchInput = z.infer<typeof deepResearchInputSchema>

export function getDeepResearchSubagentConfig(
  ctx: ToolContext,
  modelId?: string,
): StreamingSubagentToolConfig<DeepResearchInput> {
  return {
    toolName: 'deep_research',
    description:
      '委派调研子助手：深入阅读章节、世界观、大纲、Plan 等与任务相关的资料，返回结构化摘要。'
      + '在用户要求续写/改稿前需核对多处设定，或问题涉及多章多设定时使用。'
      + '若用户已 @ 章节/设定，主对话预加载内容会自动注入 task，子助手应优先使用、减少 read 调用。',
    inputSchema: deepResearchInputSchema,
    systemPrompt: RESEARCH_SYSTEM_PROMPT,
    userMessage: ({ task }) => task,
    toolNames: DEEP_RESEARCH_TOOL_NAMES,
    maxSteps: 8,
    temperature: 0.4,
    ctx,
    modelId,
  }
}

export function createDeepResearchSubagentTool(ctx: ToolContext, modelId?: string) {
  return createStreamingSubagentTool(getDeepResearchSubagentConfig(ctx, modelId))
}
