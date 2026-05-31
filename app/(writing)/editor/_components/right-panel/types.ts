/**
 * AI 助手相关类型定义
 */

export type AiMode = 'agent' | 'ask' | 'plan' | 'outline' | 'worldbook'

export type AiModel =
  | 'MiniMax-M2.7'
  | 'MiniMax-M2.1'
  | 'MiniMax-Text-01'
  | 'abab6.5s-chat'

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
  isThinking?: boolean
  icon: React.ComponentType<{ className?: string }>
}
