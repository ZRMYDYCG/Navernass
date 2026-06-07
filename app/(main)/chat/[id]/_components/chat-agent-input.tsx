'use client'

import type { AiModel } from '@/app/(writing)/editor/_components/right-panel/types'
import type { ChatAiMode } from '@/lib/ai/agents'
import type {
  SerializedBookRef,
  SerializedCharacterRef,
} from '@/lib/editor/inline-composer'
import { useCallback, useRef } from 'react'
import { InlineChapterComposer } from '@/app/(writing)/editor/_components/right-panel/inline-chapter-composer'
import { AiChatInput } from '@/components/buss'
import { useI18n } from '@/hooks/use-i18n'
import { ChatModeSelector } from './chat-mode-selector'
import { ChatModelSelector } from './chat-model-selector'

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
  /** 全部可 @ 书本（来自 useChatMentions） */
  books: SerializedBookRef[]
  /** 全部可 @ 角色（来自 useChatMentions） */
  characters: SerializedCharacterRef[]
  /** 当前选中的书本 → 写入 mentionsRef 给 send 用 */
  onBooksChange: (books: SerializedBookRef[]) => void
  /** 当前选中的角色 → 写入 mentionsRef 给 send 用 */
  onCharactersChange: (characters: SerializedCharacterRef[]) => void
}

/**
 * 主聊天页 Agent 输入框：在 AiChatInput 之上接入
 *   1) mode/model 工具栏
 *   2) 内联 @ 引用编辑器（书本 + 角色）
 *   3) 选中状态透传给 useChatMentions 桥接
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
  books,
  characters,
  onBooksChange,
  onCharactersChange,
}: ChatAgentInputProps) {
  const { t } = useI18n()
  const placeholder = t(`chat.agent.modes.${mode}.placeholder`)
  const composerRef = useRef<{ focus: () => void, insertAtChar: (char: string) => void } | null>(null)

  const handleSend = useCallback(() => {
    void onSend()
  }, [onSend])

  return (
    <AiChatInput
      value={value}
      onChange={onChange}
      onSend={handleSend}
      placeholder={placeholder}
      disabled={disabled}
      isSending={isSending}
      centered={centered}
      showVoice={showVoice}
      inputSlot={(
        <InlineChapterComposer
          ref={composerRef}
          value={value}
          onChange={onChange}
          onChaptersChange={() => { /* 主聊天页不绑定章节选择 */ }}
          onCharactersChange={onCharactersChange}
          onBooksChange={onBooksChange}
          chapters={[]}
          volumes={[]}
          characters={characters}
          worldbookEntries={[]}
          outlines={[]}
          books={books}
          placeholder={placeholder}
          disabled={disabled}
          isCompact={false}
          onSend={handleSend}
        />
      )}
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
