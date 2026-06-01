import type { ToolSet } from 'ai'
import type { ToolContext } from '../types'
import { createCharacterTimelineSubagentTool } from './character-timeline'
import { createDeepResearchSubagentTool } from './deep-research'

/** 执行模式 writer 可用的 subagent 委派工具 */
export function buildWriterSubagentTools(
  ctx: ToolContext,
  modelId?: string,
): ToolSet {
  return {
    deep_research: createDeepResearchSubagentTool(ctx, modelId),
    delegate_character_timeline: createCharacterTimelineSubagentTool(ctx, modelId),
  }
}
