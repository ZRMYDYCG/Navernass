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
  { value: 'Qwen/Qwen2.5-7B-Instruct', label: 'Qwen 2.5 7B' },
]
