import type { RouteDecision } from './types'
import { listSkills } from '../skills/types'
import { getChatModeConfig, normalizeChatMode } from './chat-modes'
import { getAgent, listAgents } from './registry'

/**
 * Chat Router：按 mode 派发到 chat 专用 specialist + skill 子集。
 *
 *   - ask         → chat-ask-specialist
 *   - brainstorm  → chat-brainstorm-specialist + brainstorm-facilitation
 *   - craft       → chat-craft-specialist + craft-discussion
 *   - polish      → chat-polish-specialist + polish-translate
 *   - agent       → chat-agent (含 propose_* 桥接工具)
 */
export interface ChatRouterInput {
  text: string
  mode: 'ask' | 'brainstorm' | 'craft' | 'polish' | 'agent' | string
}

export function routeChat(input: ChatRouterInput): RouteDecision {
  const { text } = input
  const mode = normalizeChatMode(input.mode)
  const modeConfig = getChatModeConfig(mode)

  const agent = getAgent(modeConfig.agentId)
  const agentId = agent?.id || modeConfig.agentId
  const agentSkillWhitelist = new Set(agent?.compatibleSkillIds || modeConfig.compatibleSkillIds)

  const skills = listSkills()
  const enabledSkillIds: string[] = []
  const reasons: string[] = []

  for (const skill of skills) {
    if (!modeConfig.compatibleSkillIds.includes(skill.id)) continue
    if (!agentSkillWhitelist.has(skill.id)) continue

    const triggered = skill.triggers ? skill.triggers({ text, mode }) : true
    if (triggered) {
      enabledSkillIds.push(skill.id)
      reasons.push(skill.id)
    }
  }

  const agentLabel = agent?.name || agentId

  // 兜底：注册表中没有该 agent 时用 chat-ask-specialist
  if (!getAgent(agentId) && listAgents().length > 0) {
    const fallback = getAgent('chat-ask-specialist') ? 'chat-ask-specialist' : listAgents()[0].id
    console.warn(`[chat-router] agent ${agentId} not registered, fallback to ${fallback}`)
    return {
      agentId: fallback,
      skillIds: enabledSkillIds,
      reason: `mode=${mode} → ${fallback}(fallback) skills=[${reasons.join(',') || 'none'}]`,
    }
  }

  return {
    agentId,
    skillIds: enabledSkillIds,
    reason: `mode=${mode} → ${agentLabel}(${agentId}) skills=[${reasons.join(',') || 'none'}]`,
  }
}
