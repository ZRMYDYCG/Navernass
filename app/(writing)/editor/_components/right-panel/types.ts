/**
 * AI 助手相关类型定义
 */

export type AiMode = 'agent' | 'ask' | 'plan'
export type AiModel =
  | 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B'
  | 'BAAI/bge-large-en-v1.5'
  | 'THUDM/glm-4-9b-chat'
  | 'Qwen/Qwen2.5-Coder-7B-Instruct'
  | 'Qwen2-7B-Instruct'
  | 'bge-large-zh-v1.5'
  | 'Qwen/Qwen3-8B'

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
