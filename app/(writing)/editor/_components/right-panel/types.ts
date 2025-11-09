/**
 * AI 助手相关类型定义
 */

export type AiMode = 'agent' | 'ask' | 'plan'
export type AiModel = 'Qwen/Qwen2.5-7B-Instruct'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ModeOption {
  value: AiMode
  label: string
  icon: React.ComponentType<{ className?: string }> | string
}

export interface ModelOption {
  value: AiModel
  label: string
}
