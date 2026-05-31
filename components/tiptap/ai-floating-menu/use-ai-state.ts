'use client'

import type { Editor } from '@tiptap/react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { extractTextFromUIMessage } from '@/lib/editor/selection-ai-stream'
import type { EditorAction } from '@/prompts/editor'
import { applySuggestionDiff } from '../extensions/suggestion-track'

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`{1,3}(.+?)`{1,3}/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/!\[.*?\]\(.+?\)/g, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/-{3,}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function useAIState(editor: Editor | null, onActionComplete?: () => void) {
  const { t } = useI18n()
  const [aiPrompt, setAiPrompt] = useState('')
  const lastPromptRef = useRef<string>('')
  const requestMetaRef = useRef<{ action: EditorAction, selectedText: string, customPrompt: string }>({
    action: 'custom',
    selectedText: '',
    customPrompt: '',
  })
  const selectionRef = useRef<{
    originalFrom: number
    originalTo: number
    originalText: string
    liveRange: { from: number, to: number }
  } | null>(null)
  const lastAppliedTextRef = useRef('')
  const prevStatusRef = useRef<string>('ready')
  const skipFinishEffectRef = useRef(false)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/editor/selection-ai/stream',
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: {
            ...body,
            messages,
            action: requestMetaRef.current.action,
            selectedText: requestMetaRef.current.selectedText,
            customPrompt: requestMetaRef.current.customPrompt,
          },
        }),
      }),
    [],
  )

  const { messages, sendMessage, setMessages, status, stop } = useChat({
    transport,
    onError: (err) => {
      console.error(t('tiptap.aiMenu.state.processFailedLog'), err)
    },
  })

  const isAILoading = status === 'submitted' || status === 'streaming'

  const resetAI = useCallback(() => {
    setAiPrompt('')
    setMessages([])
    selectionRef.current = null
    lastAppliedTextRef.current = ''
  }, [setMessages])

  useEffect(() => {
    if (!editor || !isAILoading) return

    const lastAssistant = [...messages].reverse().find(message => message.role === 'assistant')
    const cleanContent = stripMarkdown(extractTextFromUIMessage(lastAssistant))
    if (!cleanContent || cleanContent === lastAppliedTextRef.current) return

    const snapshot = selectionRef.current
    if (!snapshot) return

    const updatedRange = applySuggestionDiff(
      editor,
      snapshot.liveRange,
      snapshot.originalText,
      cleanContent,
    )
    if (updatedRange) {
      snapshot.liveRange = updatedRange
      lastAppliedTextRef.current = cleanContent
    }
  }, [editor, isAILoading, messages])

  useEffect(() => {
    if (skipFinishEffectRef.current) return

    const prev = prevStatusRef.current
    if ((prev === 'streaming' || prev === 'submitted') && status === 'ready') {
      resetAI()
      onActionComplete?.()
    }
    prevStatusRef.current = status
  }, [status, resetAI, onActionComplete])

  const handleAI = useCallback(async (customPrompt: string) => {
    if (!editor || !customPrompt.trim()) return

    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' ',
    )

    if (!selectedText) return

    selectionRef.current = {
      originalFrom: editor.state.selection.from,
      originalTo: editor.state.selection.to,
      originalText: selectedText,
      liveRange: { from: editor.state.selection.from, to: editor.state.selection.to },
    }

    lastPromptRef.current = customPrompt
    lastAppliedTextRef.current = ''
    requestMetaRef.current = {
      action: 'custom',
      selectedText,
      customPrompt,
    }

    setMessages([])
    try {
      await sendMessage({ text: customPrompt })
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return
      console.error(t('tiptap.aiMenu.state.processFailedLog'), error)
      resetAI()
    }
  }, [editor, resetAI, sendMessage, setMessages, t])

  const retryAI = useCallback(async () => {
    if (!lastPromptRef.current) return
    await handleAI(lastPromptRef.current)
  }, [handleAI])

  const cancelAI = useCallback(async () => {
    skipFinishEffectRef.current = true
    await stop()
    const snapshot = selectionRef.current
    if (editor && snapshot) {
      editor
        .chain()
        .focus()
        .deleteRange(snapshot.liveRange)
        .insertContentAt(snapshot.liveRange.from, snapshot.originalText)
        .run()
    }
    resetAI()
    onActionComplete?.()
    skipFinishEffectRef.current = false
  }, [editor, onActionComplete, resetAI, stop])

  return {
    aiPrompt,
    setAiPrompt,
    isAILoading,
    handleAI,
    resetAI,
    retryAI,
    cancelAI,
    lastPromptRef,
  }
}
