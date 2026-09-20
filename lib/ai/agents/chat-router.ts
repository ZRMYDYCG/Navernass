import type { RouteDecision } from './types'
import { getChatModeConfig, normalizeChatMode } from './chat-modes'
import { getAgent, listAgents } from './registry'

/**
 * Chat Router：按 mode 派发到 chat 专用 specialist。
 *
 *   - ask         → chat-ask-specialist
 *   - brainstorm  → chat-brainstorm-specialist
 *   - craft       → chat-craft-specialist
 *   - polish      → chat-polish-specialist
 *   - agent       → chat-agent (含 propose_* 桥接工具)
 */
export interface ChatRouterInput {
  text: string
  mode: 'ask' | 'brainstorm' | 'craft' | 'polish' | 'agent' | string
}

export function routeChat(input: ChatRouterInput): RouteDecision {
  const mode = normalizeChatMode(input.mode)
  const modeConfig = getChatModeConfig(mode)

  const agent = getAgent(modeConfig.agentId)
  const agentId = agent?.id || modeConfig.agentId
  const agentLabel = agent?.name || agentId

  // 兜底：注册表中没有该 agent 时用 chat-ask-specialist
  if (!getAgent(agentId) && listAgents().length > 0) {
    const fallback = getAgent('chat-ask-specialist') ? 'chat-ask-specialist' : listAgents()[0].id
    console.warn(`[chat-router] agent ${agentId} not registered, fallback to ${fallback}`)
    return {
      agentId: fallback,
      skillIds: [],
      reason: `mode=${mode} → ${fallback}(fallback)`,
    }
  }

  return {
    agentId,
    skillIds: [],
    reason: `mode=${mode} → ${agentLabel}(${agentId})`,
  }
}
