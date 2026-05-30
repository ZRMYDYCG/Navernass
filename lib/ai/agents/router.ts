import type { RouteDecision } from './types'
import { listSkills } from '../skills/types'
import { DEFAULT_AGENT_ID, listAgents } from './registry'

/**
 * Router Agent (MVP 简化版)
 *
 * 当前策略：纯启发式路由（无 LLM 调用），后续阶段可替换为 generateObject。
 *   - mode === 'agent'  → 走 specialist + 启用所有匹配 skill
 *   - mode === 'plan'   → 暂时也走 writer（Planner 未实装），但禁用 editor-surgical skill
 *   - mode === 'ask'    → 走 writer，禁用 propose_edit 类工具型 skill
 *
 * 这样保留了 specialist/skill 的扩展位，让 stream/route.ts 不需要因为
 * 后续接 Planner/Editor agent 而再次大改。
 */
export interface RouterInput {
  text: string
  mode: 'agent' | 'ask' | 'plan' | string
}

export function route(input: RouterInput): RouteDecision {
  const { text, mode } = input
  const agents = listAgents()
  const writerExists = agents.some(a => a.id === DEFAULT_AGENT_ID)
  const agentId = writerExists ? DEFAULT_AGENT_ID : (agents[0]?.id || DEFAULT_AGENT_ID)

  const skills = listSkills()
  const enabledSkillIds: string[] = []
  const reasons: string[] = []

  for (const skill of skills) {
    // ask 模式不启用编辑器手术刀（避免误改稿）
    if (mode === 'ask' && skill.id === 'editor-surgical') continue

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
