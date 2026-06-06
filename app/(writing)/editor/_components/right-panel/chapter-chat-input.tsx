'use client'

import type { Chapter } from '@/lib/supabase/sdk'
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { AiChatInput, type AiChatInputProps } from '@/components/buss'
import { hasComposerContent } from '@/lib/editor/inline-composer'
import {
  selectOrderedChapters,
  selectOrderedOutlines,
  selectOrderedVolumes,
  selectOrderedWorldbookEntries,
  useChaptersStore,
  useCharacterMaterialStore,
  useWorldviewStore,
} from '@/store'
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
  const searchParams = useSearchParams()
  const novelId = searchParams.get('id') || ''
  const allChapters = useChaptersStore(useShallow(selectOrderedChapters))
  const allVolumes = useChaptersStore(useShallow(selectOrderedVolumes))
  const allCharacters = useCharacterMaterialStore(
    useShallow(s => s.characters.filter(c => !c.novel_id || c.novel_id === novelId)),
  )
  const characterRefs = useMemo(
    () => allCharacters.map(c => ({ id: c.id, name: c.name })),
    [allCharacters],
  )
  const allWorldbookEntries = useWorldviewStore(useShallow(selectOrderedWorldbookEntries))
  const allOutlines = useWorldviewStore(useShallow(selectOrderedOutlines))
  const worldbookRefs = useMemo(
    () => allWorldbookEntries.map(e => ({ id: e.id, title: e.title })),
    [allWorldbookEntries],
  )
  const outlineRefs = useMemo(
    () => allOutlines.map(o => ({ id: o.id, title: o.title })),
    [allOutlines],
  )
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
          characters={characterRefs}
          worldbookEntries={worldbookRefs}
          outlines={outlineRefs}
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
