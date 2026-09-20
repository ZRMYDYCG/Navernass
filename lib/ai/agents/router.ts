import type { RouteDecision } from './types'
import { getModeConfig, normalizeMode } from './modes'
import { DEFAULT_AGENT_ID, getAgent, listAgents } from './registry'

/**
 * Router：按前端 mode 派发到独立 specialist agent。
 *
 *   - ask       → ask-specialist（只读顾问）
 *   - plan      → plan-specialist
 *   - outline   → outline-specialist
 *   - worldbook → worldbook-specialist
 *   - agent     → writer（执行写作，含 deep_research 子 Agent 工具）
 */
export interface RouterInput {
  text: string
  mode: 'agent' | 'ask' | 'plan' | 'outline' | 'worldbook' | string
}

export function route(input: RouterInput): RouteDecision {
  const mode = normalizeMode(input.mode)
  const modeConfig = getModeConfig(mode)

  const agents = listAgents()
  const preferredAgent = getAgent(modeConfig.agentId)
  const writerExists = agents.some(a => a.id === DEFAULT_AGENT_ID)
  const agentId = preferredAgent
    ? modeConfig.agentId
    : (writerExists ? DEFAULT_AGENT_ID : (agents[0]?.id || DEFAULT_AGENT_ID))

  const agent = getAgent(agentId)
  const agentLabel = agent?.name || agentId

  return {
    agentId,
    skillIds: [],
    reason: `mode=${mode} → ${agentLabel}(${agentId})`,
  }
}
