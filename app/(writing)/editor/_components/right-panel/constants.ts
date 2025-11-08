import type { ModelOption, ModeOption } from './types'
import { MessageSquare, Sparkles } from 'lucide-react'

/**
 * AI 模式选项配置
 */
export const MODE_OPTIONS: ModeOption[] = [
  { value: 'ask', label: 'Ask', icon: MessageSquare },
  { value: 'agent', label: '智能体', icon: Sparkles },
  { value: 'continue', label: '续写', icon: '✍️' },
  { value: 'polish', label: '润色', icon: '✨' },
]

/**
 * AI 模型选项配置
 */
export const MODEL_OPTIONS: ModelOption[] = [
  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
]
