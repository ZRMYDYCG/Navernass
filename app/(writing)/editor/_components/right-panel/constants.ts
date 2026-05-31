import type { ModelOption, ModeOption } from './types'
import { Bot, ClipboardList, Globe2, ListTree, MessageSquare } from 'lucide-react'
import { MODEL_ICON_MAP } from './model-icons'

/**
 * AI 模式选项配置
 */
export const MODE_OPTIONS: ModeOption[] = [
  { value: 'agent', label: 'Agent', icon: Bot },
  { value: 'ask', label: 'Ask', icon: MessageSquare },
  { value: 'plan', label: 'Plan', icon: ClipboardList },
  { value: 'outline', label: 'Outline', icon: ListTree },
  { value: 'worldbook', label: 'Worldbook', icon: Globe2 },
]

/**
 * AI 模型选项配置（Minimax，OpenAI 兼容）
 */
export const MODEL_OPTIONS: ModelOption[] = [
  { value: 'MiniMax-M2.7', label: 'MiniMax M2.7', isThinking: true, icon: MODEL_ICON_MAP['MiniMax-M2.7'] },
  { value: 'MiniMax-M2.1', label: 'MiniMax M2.1', isThinking: true, icon: MODEL_ICON_MAP['MiniMax-M2.1'] },
  { value: 'MiniMax-Text-01', label: 'MiniMax Text-01', icon: MODEL_ICON_MAP['MiniMax-Text-01'] },
  { value: 'abab6.5s-chat', label: 'abab6.5s', icon: MODEL_ICON_MAP['abab6.5s-chat'] },
]
