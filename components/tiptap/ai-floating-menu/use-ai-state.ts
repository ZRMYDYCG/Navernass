import type { Editor } from '@tiptap/react'
import { useRef, useState } from 'react'
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
  const [aiPrompt, setAiPrompt] = useState('')
  const [isAILoading, setIsAILoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastPromptRef = useRef<string>('')
  const selectionRef = useRef<{
    originalFrom: number
    originalTo: number
    originalText: string
    liveRange: { from: number, to: number }
  } | null>(null)

  const resetAI = () => {
    setAiPrompt('')
    setIsAILoading(false)
    selectionRef.current = null
  }

  const handleAI = async (customPrompt: string) => {
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

    try {
      setIsAILoading(true)
      lastPromptRef.current = customPrompt

      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/editor/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'custom',
          text: selectedText,
          prompt: customPrompt,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('AI 请求失败')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('无法读取响应')
      }

      let buffer = ''
      let fullContent = ''
      let didApply = false
      let applyTimer: ReturnType<typeof setTimeout> | null = null

      const applyLiveDiff = () => {
        const snapshot = selectionRef.current
        if (!snapshot) return

        const cleanContent = stripMarkdown(fullContent)
        if (!cleanContent) return

        const updatedRange = applySuggestionDiff(
          editor,
          snapshot.liveRange,
          snapshot.originalText,
          cleanContent,
        )
        if (updatedRange) {
          snapshot.liveRange = updatedRange
          didApply = true
        }
      }

      const scheduleApply = () => {
        if (applyTimer) return
        applyTimer = setTimeout(() => {
          applyTimer = null
          applyLiveDiff()
        }, 120)
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue

          try {
            const jsonStr = trimmedLine.slice(6)
            const data = JSON.parse(jsonStr)

            if (data.type === 'content') {
              fullContent += data.data
              scheduleApply()
            } else if (data.type === 'done') {
              setIsAILoading(false)
              applyLiveDiff()
              resetAI()
              onActionComplete?.()
            } else if (data.type === 'error') {
              throw new Error(data.data)
            }
          } catch {
          }
        }
      }

      if (!didApply) {
        setIsAILoading(false)
        applyLiveDiff()
        resetAI()
        onActionComplete?.()
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') { /* empty */ } else {
        console.error('AI 处理失败:', error)
      }
      setIsAILoading(false)
      resetAI()
    } finally {
      abortControllerRef.current = null
    }
  }

  const retryAI = async () => {
    if (!lastPromptRef.current) return
    await handleAI(lastPromptRef.current)
  }

  const cancelAI = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
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
  }

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
