import type { StreamTextOnFinishCallback, StreamTextOnStepFinishCallback, ToolSet } from 'ai'
import type { AgentRunInput } from './types'
import { getAgent } from './registry'
import { normalizeMode, type AiChatMode } from './modes'
import { runNovelSpecialistAgent } from './run-specialist'
import { runWriterAgent } from './writer'

export interface RunRoutedAgentOptions extends AgentRunInput {
  mode?: string
  userText?: string
  onFinish?: StreamTextOnFinishCallback<ToolSet>
  onStepFinish?: StreamTextOnStepFinishCallback<ToolSet>
}

const MODE_TO_AGENT: Record<AiChatMode, string> = {
  ask: 'ask-specialist',
  plan: 'plan-specialist',
  outline: 'outline-specialist',
  worldbook: 'worldbook-specialist',
  agent: 'writer',
}

/**
 * 按 router 决策调度已注册的 specialist / writer。
 * 各 mode 对应独立 agent id，共享 runNovelSpecialistAgent 或 writer 的 subagent 能力。
 */
export function runRoutedAgent(input: RunRoutedAgentOptions) {
  const mode = normalizeMode(input.mode)
  const agentId = input.decision.agentId

  const agent = getAgent(agentId)
  if (!agent) {
    throw new Error(`Unknown agent: ${agentId}`)
  }

  const expectedId = MODE_TO_AGENT[mode]
  if (agentId !== expectedId) {
    console.warn(
      `[run-routed] mode=${mode} expected agent ${expectedId}, got ${agentId}; using ${agentId}`,
    )
  }

  if (agentId === 'writer') {
    return runWriterAgent({ ...input, mode, userText: input.userText })
  }

  return runNovelSpecialistAgent({
    ...input,
    agentId,
    mode,
    userText: input.userText,
  })
}
