import type { RouteDecision } from './types'
import { listSkills } from '../skills/types'
import { getModeConfig, normalizeMode } from './modes'
import { DEFAULT_AGENT_ID, getAgent, listAgents } from './registry'

/**
 * Router Agent (MVP)
 *
 * 按前端选择的 mode 决定 agent、skill 白名单与工具子集：
 *   - ask       → 只读咨询
 *   - plan      → Plan 规划文件，启用 story-planning
 *   - outline   → 大纲树，启用 outline-editing
 *   - worldbook → 世界观库，启用 worldbook-editing
 *   - agent     → 完整写作代理，可按关键词启用 editor-surgical
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

  return {
    agentId,
    skillIds: enabledSkillIds,
    reason: `mode=${mode} → agent=${agentId} skills=[${reasons.join(',')}]`,
  }
}
