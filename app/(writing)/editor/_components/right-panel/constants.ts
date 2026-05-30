import type { ModelOption, ModeOption } from './types'
import { MessageSquare } from 'lucide-react'

/**
 * AI 模式选项配置
 */
export const MODE_OPTIONS: ModeOption[] = [
  { value: 'ask', label: 'Ask', icon: MessageSquare },
]

/**
 * AI 模型选项配置（Minimax，OpenAI 兼容）
 */
export const MODEL_OPTIONS: ModelOption[] = [
  { value: 'MiniMax-M2.7', label: 'MiniMax M2.7', isThinking: true },
  { value: 'MiniMax-M2.1', label: 'MiniMax M2.1', isThinking: true },
  { value: 'MiniMax-Text-01', label: 'MiniMax Text-01' },
  { value: 'abab6.5s-chat', label: 'abab6.5s' },
]
