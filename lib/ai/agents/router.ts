import type { RouteDecision } from './types'
import type { Skill } from './types'
import { listSkills } from '../skills/types'
import { selectEnabledSkillIds } from '@/lib/skills/select-skills'
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

export function route(input: RouterInput, skills: Skill[] = listSkills()): RouteDecision {
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

  const { skillIds: enabledSkillIds, reasons } = selectEnabledSkillIds({
    text,
    mode,
    modeCompatibleSkillIds: modeConfig.compatibleSkillIds,
    agentSkillWhitelist,
    skills,
  })

  const agentLabel = agent?.name || agentId

  return {
    agentId,
    skillIds: enabledSkillIds,
    reason: `mode=${mode} → ${agentLabel}(${agentId}) skills=[${reasons.join(',') || 'none'}]`,
  }
}
