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
  { value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B', label: 'DeepSeek R1 Qwen 7B' },
  { value: 'BAAI/bge-large-en-v1.5', label: 'BGE Large EN' },
  { value: 'THUDM/glm-4-9b-chat', label: 'GLM-4 9B Chat' },
  { value: 'Qwen/Qwen2.5-Coder-7B-Instruct', label: 'Qwen2.5 Coder 7B' },
  { value: 'Qwen2-7B-Instruct', label: 'Qwen2 7B' },
  { value: 'bge-large-zh-v1.5', label: 'BGE Large ZH' },
  { value: 'Qwen/Qwen3-8B', label: 'Qwen3 8B' },
]
