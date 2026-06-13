import type { ToolContext } from '../types'
import { z } from 'zod'
import { characterScriptwriterAgent } from '../character-scriptwriter'
import { createStreamingSubagentTool } from './create-streaming-subagent-tool'
import type { StreamingSubagentToolConfig } from './run-subagent-stream'

const SCRIPTWRITER_TOOL_NAMES = characterScriptwriterAgent.defaultToolNames ?? []

export const characterTimelineInputSchema = z.object({
  characterId: z.string().uuid().optional().describe('角色 id；对话已 @ 角色时可省略'),
  characterName: z.string().optional().describe('角色名称（便于子助手理解）'),
  task: z.string().describe('交给角色剧本师的任务说明'),
})

export type CharacterTimelineInput = z.infer<typeof characterTimelineInputSchema>

function resolveCharacter(input: CharacterTimelineInput, ctx: ToolContext) {
  const characterId = input.characterId || ctx.focusCharacterId || ctx.characterId
  const characterName = input.characterName || ctx.focusCharacterName
  return { characterId, characterName }
}

export function getCharacterTimelineSubagentConfig(
  ctx: ToolContext,
  modelId?: string,
): StreamingSubagentToolConfig<CharacterTimelineInput> {
  const hasFocus = Boolean(ctx.focusCharacterId || ctx.characterId)

  return {
    toolName: 'delegate_character_timeline',
    description:
      `委派角色剧本子助手：为指定角色梳理/维护时间线事件（create/update/delete_character_event），`
      + `并参考章节与设定。用户 @ 了角色或讨论某角色成长弧/关系/里程碑时使用。${
        hasFocus
          ? `当前对话已聚焦角色 id=${ctx.focusCharacterId || ctx.characterId}，可省略 characterId。`
          : '调用前需 characterId；可让用户在输入框 @ 角色或先 list_characters 查询。'}`,
    inputSchema: characterTimelineInputSchema,
    systemPrompt: (input) => {
      const { characterId, characterName } = resolveCharacter(input, ctx)
      if (!characterId) {
        return '缺少 characterId：请让用户 @ 角色或提供 id。'
      }
      const focus = characterName
        ? `**当前服务的角色**：${characterName}（id: ${characterId}）`
        : `**当前服务的角色 id**：${characterId}`
      return `${focus}\n\n${characterScriptwriterAgent.systemPrompt}\n\n所有需要 characterId 的工具调用请使用上面的 id。`
    },
    userMessage: ({ task }) => task,
    toolNames: SCRIPTWRITER_TOOL_NAMES,
    maxSteps: 6,
    temperature: 0.75,
    ctx,
    modelId,
    validateInput: (input, base) => {
      const { characterId } = resolveCharacter(input, base)
      if (!characterId) {
        return '缺少 characterId：请让用户在输入框 @ 角色，或先 list_characters 再传入 id。'
      }
      return null
    },
    resolveContext: (input, base) => {
      const { characterId } = resolveCharacter(input, base)
      if (!characterId) return base
      return { ...base, characterId, focusCharacterId: characterId }
    },
  }
}

export function createCharacterTimelineSubagentTool(ctx: ToolContext, modelId?: string) {
  return createStreamingSubagentTool(getCharacterTimelineSubagentConfig(ctx, modelId))
}
