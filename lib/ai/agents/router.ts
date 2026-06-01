import type { RouteDecision } from './types'
import { listSkills } from '../skills/types'
import { getModeConfig, normalizeMode } from './modes'
import { DEFAULT_AGENT_ID, getAgent, listAgents } from './registry'

/**
 * Router：按前端 mode 派发到独立 specialist agent + skill 子集。
 *
 *   - ask       → ask-specialist（只读顾问）
 *   - plan      → plan-specialist + story-planning
 *   - outline   → outline-specialist + outline-editing
 *   - worldbook → worldbook-specialist + worldbook-editing
 *   - agent     → writer（执行写作，含 deep_research 子 Agent 工具）
 */
export interface RouterInput {
  text: string
  mode: 'agent' | 'ask' | 'plan' | 'outline' | 'worldbook' | string
}

export function route(input: RouterInput): RouteDecision {
  const { text } = input
  const mode = normalizeMode(input.mode)
  const modeConfig = getModeConfig(mode)

  const agents = listAgents()
  const preferredAgent = getAgent(modeConfig.agentId)
  const writerExists = agents.some(a => a.id === DEFAULT_AGENT_ID)
  const agentId = preferredAgent
    ? modeConfig.agentId
    : (writerExists ? DEFAULT_AGENT_ID : (agents[0]?.id || DEFAULT_AGENT_ID))

  const agent = getAgent(agentId)
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

  return {
    agentId,
    skillIds: enabledSkillIds,
    reason: `mode=${mode} → ${agentLabel}(${agentId}) skills=[${reasons.join(',') || 'none'}]`,
  }
}
