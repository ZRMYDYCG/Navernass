import type { SupabaseClient } from '@supabase/supabase-js'
import type { ModelMessage, Tool, UIMessage } from 'ai'

/**
 * 多 agent 架构的核心类型定义
 *
 * 设计原则：
 * - Tool: 具体可执行的函数（ai-sdk 原生）
 * - Skill: 系统提示片段 + 工具子集（自造抽象，类似 Anthropic Skills）
 * - Agent: 一个独立的 LLM 调用单元（system + tools + 模型选择）
 * - Router: 决定派给哪个 agent + 加载哪些 skill 的轻量分类器
 */

/** 调用任意工具时共享的运行时上下文 */
export interface ToolContext {
  supabase: SupabaseClient
  userId: string
  novelId: string
  conversationId?: string
  /** 当前对话已选中的章节 id（用户通过 @ 选择的） */
  selectedChapterIds?: string[]
}

/** Skill：可挂载到 agent 上的能力包 */
export interface Skill {
  id: string
  name: string
  /** 给 router / 用户阅读的简短描述 */
  description: string
  /** 注入到 agent system prompt 的额外片段 */
  systemPrompt: string
  /** 该 skill 暴露的工具名（必须在 buildTools 注册表中存在） */
  toolNames?: string[]
  /** 可选的硬触发：返回 true 时 router 强制启用该 skill */
  triggers?: (input: { text: string, mode: string }) => boolean
}

/** Agent 元信息（构建时不依赖运行时） */
export interface AgentDefinition {
  id: string
  name: string
  description: string
  /** 默认 system prompt（会与 skill systemPrompt 拼接） */
  systemPrompt: string
  /** 该 agent 默认就拥有的工具名（不依赖 skill） */
  defaultToolNames?: string[]
  /** 该 agent 兼容的 skill id 白名单（router 只能从中选） */
  compatibleSkillIds?: string[]
}

/** Router 输出 */
export interface RouteDecision {
  agentId: string
  skillIds: string[]
  /** 决策原因（用于日志/调试，前端可显示） */
  reason: string
}

/** Agent 运行入参 */
export interface AgentRunInput {
  uiMessages: UIMessage[]
  /** 已经包含章节上下文注入后的最终 model messages */
  modelMessages: ModelMessage[]
  /** 模型 id（由前端 ModelSelector 选择） */
  modelId?: string
  /** 工具运行时上下文 */
  toolContext: ToolContext
  /** Router 决策结果 */
  decision: RouteDecision
}

/** 工具构建器：(ctx) => Tool */
export type ToolBuilder = (ctx: ToolContext) => Tool
