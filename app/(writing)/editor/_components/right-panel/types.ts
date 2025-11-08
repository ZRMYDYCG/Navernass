/**
 * AI 助手相关类型定义
 */

export type AiMode = 'agent' | 'ask' | 'continue' | 'polish'
export type AiModel = 'gpt-4' | 'claude-3.5-sonnet' | 'gpt-3.5-turbo'

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
