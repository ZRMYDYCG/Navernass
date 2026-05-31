'use client'

import type { Chapter } from '@/lib/supabase/sdk'
import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { AiChatInput, type AiChatInputProps } from '@/components/buss'
import { hasComposerContent } from '@/lib/editor/inline-composer'
import { selectOrderedChapters, selectOrderedVolumes, useChaptersStore } from '@/store'
import type { AiMode } from './types'
import { InlineChapterComposer } from './inline-chapter-composer'
import { ModeSelector } from './mode-selector'
import { ModelSelector } from './model-selector'
import type { AiModel } from './types'
import { toChapterRefs } from './novel-chat/session-host'

type ChapterChatInputProps = Omit<AiChatInputProps, 'references' | 'inputLeading' | 'onInputDrop' | 'value' | 'onChange' | 'onSend' | 'toolbar'> & {
  value: string
  onChange: (value: string) => void
  onSend: () => void | Promise<void>
  onSelectionChange: (chapters: Chapter[]) => void
  mode: AiMode
  model: AiModel
  onModeChange: (mode: AiMode) => void
  onModelChange: (model: AiModel) => void
}

export function ChapterChatInput({
  value,
  onChange,
  onSend,
  onSelectionChange,
  mode,
  model,
  onModeChange,
  onModelChange,
  disabled,
  isSending,
  placeholder,
  variant = 'compact',
  maxHeight,
  ...rest
}: ChapterChatInputProps) {
  const allChapters = useChaptersStore(useShallow(selectOrderedChapters))
  const allVolumes = useChaptersStore(useShallow(selectOrderedVolumes))
  const isCompact = variant === 'compact'
  const resolvedMaxHeight = maxHeight ?? (isCompact ? 168 : 180)

  const canSend = hasComposerContent(value) && !disabled && !isSending

  const handleComposerChaptersChange = useCallback((chapters: Array<{ id: string, title: string }>) => {
    onSelectionChange(toChapterRefs(chapters))
  }, [onSelectionChange])

  return (
    <AiChatInput
      {...rest}
      variant={variant}
      placeholder={placeholder}
      disabled={disabled}
      isSending={isSending}
      canSendOverride={canSend}
      onSend={() => void onSend()}
      inputSlot={(
        <InlineChapterComposer
          value={value}
          onChange={onChange}
          onChaptersChange={handleComposerChaptersChange}
          chapters={allChapters}
          volumes={allVolumes}
          placeholder={placeholder}
          disabled={disabled}
          isCompact={isCompact}
          maxHeight={resolvedMaxHeight}
          onSend={() => {
            void onSend()
          }}
        />
      )}
      toolbar={(
        <>
          <ModeSelector value={mode} onChange={onModeChange} />
          <ModelSelector value={model} onChange={onModelChange} />
        </>
      )}
    />
  )
}
