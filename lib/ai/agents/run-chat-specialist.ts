import type { StreamTextOnFinishCallback, StreamTextOnStepFinishCallback, ToolSet } from 'ai'
import type { AgentDefinition, AgentRunInput } from './types'
import { stepCountIs, streamText } from 'ai'
import { getMinimaxModel } from '@/lib/ai/minimax'
import type { Skill } from './types'
import { pickSkillsByIds, buildSkillLookup } from '@/lib/skills/router-utils'
import { listSkills } from '../skills/types'
import { buildTools } from '../tools/registry'
import {
  getChatModeConfig,
  isToolAllowedInChatMode,
  normalizeChatMode,
  type ChatAiMode,
} from './chat-modes'
import { getAgent } from './registry'

export interface RunChatSpecialistOptions extends AgentRunInput {
  /** 与 chat-modes 对齐，决定工具白名单与 overlay */
  mode: ChatAiMode | string
  /** 注册表中的 specialist agent id */
  agentId: string
  /** 本回合用户输入（用于 router 决策日志） */
  userText?: string
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

/** 拼接 agent 系统 prompt：agent 默认 + mode overlay + 选中 skill */
export function buildChatSpecialistSystemPrompt(
  agent: AgentDefinition,
  mode: ChatAiMode | string,
  skillIds: string[],
  skillLookup?: Map<string, Skill>,
): string {
  const modeId = normalizeChatMode(mode)
  const modeConfig = getChatModeConfig(modeId)
  const lookup = skillLookup ?? buildSkillLookup(listSkills())
  const skills = pickSkillsByIds(skillIds, lookup)

  return [
    agent.systemPrompt,
    `【模式优先级】用户可在对话中途切换 mode；务必以本回合「当前 mode」指令为准执行，勿根据历史消息里的旧 mode 说明拒绝操作或重复提示切换 mode。`,
    modeConfig.systemPromptOverlay,
    ...skills.map(s => s.systemPrompt),
  ].filter(Boolean).join('\n\n')
}

/**
 * Chat 页 specialist 执行器。
 *
 * 与编辑器的 runNovelSpecialistAgent 区别：
 *   - mode config 走 chat-modes（不需要 novelId）
 *   - 桥接工具（propose_*）的 novelId 来自工具 call input，不来自 ToolContext
 *   - 没有 subagent 触发提示（Chat 页无聚焦角色 / 无章节上下文）
 */
export function runChatSpecialistAgent(input: RunChatSpecialistOptions) {
  const {
    agentId,
    mode,
    decision,
    modelMessages,
    modelId,
    toolContext,
    onFinish,
    onStepFinish,
    skillLookup,
  } = input

  const agent = resolveAgent(agentId)
  const modeConfig = getChatModeConfig(mode)
  const lookup = skillLookup ?? buildSkillLookup(listSkills())
  const systemPrompt = buildChatSpecialistSystemPrompt(
    agent,
    modeConfig.id,
    decision.skillIds,
    lookup,
  )

  const toolNameSet = new Set<string>(modeConfig.toolNames)
  const skills = pickSkillsByIds(decision.skillIds, lookup)
  skills.forEach(s => s.toolNames?.forEach(n => toolNameSet.add(n)))

  const allowedToolNames = Array.from(toolNameSet).filter(name =>
    isToolAllowedInChatMode(name, modeConfig.id),
  )
  const tools: ToolSet = buildTools(allowedToolNames, toolContext)

  return streamText({
    model: getMinimaxModel(modelId),
    system: systemPrompt,
    messages: modelMessages,
    tools,
    temperature: modeConfig.temperature ?? 0.7,
    stopWhen: stepCountIs(modeConfig.maxSteps),
    onFinish,
    onStepFinish,
    onAbort: ({ steps }) => {
      console.warn(`[chat/${agentId}] streamText aborted after`, steps.length, 'step(s)')
    },
    onError: (e) => {
      console.error(`[chat/${agentId}] streamText error:`, e)
    },
  })
}
