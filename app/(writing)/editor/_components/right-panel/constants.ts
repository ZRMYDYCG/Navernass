import type { ModelOption, ModeOption } from './types'
import { MessageSquare } from 'lucide-react'

/**
 * AI 模式选项配置
 */
export const MODE_OPTIONS: ModeOption[] = [
  { value: 'ask', label: 'Ask', icon: MessageSquare },
]

/**
 * AI 模型选项配置
 */
export const MODEL_OPTIONS: ModelOption[] = [
  { value: 'Qwen/Qwen2.5-7B-Instruct', label: 'Qwen 2.5 7B' },
]
