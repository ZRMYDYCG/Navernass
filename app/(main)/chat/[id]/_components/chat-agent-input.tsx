'use client'

import { AiChatInput } from '@/components/buss'
import { useI18n } from '@/hooks/use-i18n'
import { ChatModelSelector } from './chat-model-selector'
import { ChatModeSelector } from './chat-mode-selector'
import type { ChatAiMode } from '@/lib/ai/agents'
import type { AiModel } from '@/app/(writing)/editor/_components/right-panel/types'

interface ChatAgentInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void | Promise<void>
  mode: ChatAiMode
  model: AiModel
  onModeChange: (mode: ChatAiMode) => void
  onModelChange: (model: AiModel) => void
  disabled?: boolean
  isSending?: boolean
  centered?: boolean
  showVoice?: boolean
}

/**
 * Chat Agent 输入框：在 AiChatInput 之上接入 mode/model 工具栏。
 * 模式/模型切换由外部 useChatAgent 维护；本组件只负责 UI。
 */
export function ChatAgentInput({
  value,
  onChange,
  onSend,
  mode,
  model,
  onModeChange,
  onModelChange,
  disabled = false,
  isSending = false,
  centered = false,
  showVoice = true,
}: ChatAgentInputProps) {
  const { t } = useI18n()
  const placeholder = t(`chat.agent.modes.${mode}.placeholder`)

  return (
    <AiChatInput
      value={value}
      onChange={onChange}
      onSend={onSend}
      placeholder={placeholder}
      disabled={disabled}
      isSending={isSending}
      centered={centered}
      showVoice={showVoice}
      toolbar={(
        <>
          <ChatModeSelector value={mode} onChange={onModeChange} disabled={disabled || isSending} />
          <div className="flex-1 min-w-0">
            <ChatModelSelector value={model} onChange={onModelChange} />
          </div>
        </>
      )}
    />
  )
}
