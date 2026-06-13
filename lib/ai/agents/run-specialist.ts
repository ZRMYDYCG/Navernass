import type { StreamTextOnFinishCallback, StreamTextOnStepFinishCallback, ToolSet } from 'ai'
import type { AiChatMode } from './modes'
import type { AgentDefinition, AgentRunInput } from './types'
import { stepCountIs, streamText } from 'ai'
import { getMinimaxModel } from '@/lib/ai/minimax'
import type { Skill } from './types'
import { pickSkillsByIds, buildSkillLookup } from '@/lib/skills/router-utils'
import { listSkills } from '../skills/types'
import { buildTools } from '../tools/registry'
import { buildModeMismatchHint } from './mode-hints'
import { getModeConfig, isToolAllowedInMode, normalizeMode } from './modes'
import { getAgent } from './registry'
import { buildSubagentTriggerHint } from './subagent-trigger-hints'

export interface RunNovelSpecialistOptions extends AgentRunInput {
  /** 与 modes 对齐，决定工具白名单与 overlay */
  mode: AiChatMode | string
  /** 注册表中的 specialist / writer id */
  agentId: string
  /** 本回合用户输入（用于 mode 意图提示） */
  userText?: string
  /** 额外工具（如 subagent 委派），须已通过 mode 白名单或仅 writer 注入 */
  extraTools?: ToolSet
  skillLookup?: Map<string, Skill>
  onFinish?: StreamTextOnFinishCallback<ToolSet>
  onStepFinish?: StreamTextOnStepFinishCallback<ToolSet>
}

function resolveAgent(agentId: string): AgentDefinition {
  const agent = getAgent(agentId)
  if (!agent) {
    throw new Error(`Unknown agent: ${agentId}`)
  }
  return agent
}

export function buildNovelSpecialistSystemPrompt(
  agent: AgentDefinition,
  mode: AiChatMode | string,
  skillIds: string[],
  userText?: string,
  subagentOptions?: { hasFocusCharacter?: boolean, focusCharacterName?: string },
  skillLookup?: Map<string, Skill>,
): string {
  const modeId = normalizeMode(mode)
  const modeConfig = getModeConfig(modeId)
  const lookup = skillLookup ?? buildSkillLookup(listSkills())
  const skills = pickSkillsByIds(skillIds, lookup)

  const mismatchHint = userText ? buildModeMismatchHint(userText, modeId) : null
  const subagentHint = userText && agent.id === 'writer'
    ? buildSubagentTriggerHint(userText, modeId, subagentOptions)
    : null

  return [
    agent.systemPrompt,
    `【模式优先级】用户可在对话中途切换模式；务必以本回合「当前模式」指令为准执行，勿根据历史消息里的旧模式说明拒绝操作或重复提示切换模式。`,
    modeConfig.systemPromptOverlay,
    mismatchHint,
    subagentHint,
    ...skills.map(s => s.systemPrompt),
  ].filter(Boolean).join('\n\n')
}

export function runNovelSpecialistAgent(input: RunNovelSpecialistOptions) {
  const {
    agentId,
    mode,
    decision,
    modelMessages,
    modelId,
    toolContext,
    extraTools,
    userText,
    onFinish,
    onStepFinish,
    skillLookup,
  } = input

  const agent = resolveAgent(agentId)
  const modeConfig = getModeConfig(mode)
  const lookup = skillLookup ?? buildSkillLookup(listSkills())
  const systemPrompt = buildNovelSpecialistSystemPrompt(
    agent,
    modeConfig.id,
    decision.skillIds,
    userText,
    {
      hasFocusCharacter: Boolean(toolContext.focusCharacterId || toolContext.characterId),
      focusCharacterName: toolContext.focusCharacterName,
    },
    lookup,
  )

  const toolNameSet = new Set<string>(modeConfig.toolNames)
  const skills = pickSkillsByIds(decision.skillIds, lookup)
  skills.forEach(s => s.toolNames?.forEach(n => toolNameSet.add(n)))

  const allowedToolNames = Array.from(toolNameSet).filter(name =>
    isToolAllowedInMode(name, modeConfig.id),
  )
  const tools: ToolSet = {
    ...buildTools(allowedToolNames, toolContext),
    ...extraTools,
  }

  return streamText({
    model: getMinimaxModel(modelId),
    system: systemPrompt,
    messages: modelMessages,
    tools,
    temperature: modeConfig.id === 'ask' ? 0.5 : 0.7,
    stopWhen: stepCountIs(modeConfig.maxSteps),
    onFinish,
    onStepFinish,
    onAbort: ({ steps }) => {
      console.warn(`[${agentId}] streamText aborted after`, steps.length, 'step(s)')
    },
    onError: (e) => {
      console.error(`[${agentId}] streamText error:`, e)
    },
  })
}
