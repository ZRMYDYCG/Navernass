'use client'

import { AiChatInput } from '@/components/buss'

interface ChatInputBoxProps {
  onSend?: (message: string) => void | Promise<void>
  placeholder?: string
  disabled?: boolean
  centered?: boolean
}

/** @deprecated 请直接使用 `@/components/buss` 的 AiChatInput */
export function ChatInputBox({
  onSend,
  placeholder,
  disabled = false,
  centered = false,
}: ChatInputBoxProps) {
  return (
    <AiChatInput
      onSend={message => onSend?.(message)}
      placeholder={placeholder}
      disabled={disabled}
      centered={centered}
      showVoice
    />
  )
}
