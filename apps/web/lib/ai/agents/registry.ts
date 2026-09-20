import type { AgentDefinition } from './types'

/**
 * Agent 注册表
 *
 * 各 specialist agent 在自己的文件中定义并通过 registerAgent 注入。
 * Router 只感知 id + description，无需依赖具体实现。
 */
const agents = new Map<string, AgentDefinition>()

export function registerAgent(def: AgentDefinition) {
  if (agents.has(def.id)) {
    throw new Error(`Agent already registered: ${def.id}`)
  }
  agents.set(def.id, def)
}

export function getAgent(id: string): AgentDefinition | undefined {
  return agents.get(id)
}

export function listAgents(): AgentDefinition[] {
  return Array.from(agents.values())
}

/** 默认兜底 agent（router 无法决策时使用） */
export const DEFAULT_AGENT_ID = 'writer'
