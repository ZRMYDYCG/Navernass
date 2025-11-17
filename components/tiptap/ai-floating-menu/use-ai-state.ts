import type { Editor } from '@tiptap/react'
import { useRef, useState } from 'react'

export function useAIState(editor: Editor | null, onActionComplete?: () => void) {
  const [aiPrompt, setAiPrompt] = useState('')
  const [isAILoading, setIsAILoading] = useState(false)
  const [aiStreamContent, setAiStreamContent] = useState('')
  const [aiCompleted, setAiCompleted] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastPromptRef = useRef<string>('')

  const resetAI = () => {
    setAiStreamContent('')
    setAiCompleted(false)
    setAiPrompt('')
  }

  const retryAI = async () => {
    if (!lastPromptRef.current) return
    setAiStreamContent('')
    setAiCompleted(false)
    await handleAI(lastPromptRef.current)
  }

  const applyReplace = () => {
    if (!editor || !aiStreamContent) return
    const { from } = editor.state.selection
    editor.chain().focus().deleteSelection().insertContent(aiStreamContent).run()
    
    const newTo = from + aiStreamContent.length
    requestAnimationFrame(() => {
      editor.chain().focus().setTextSelection({ from, to: newTo }).run()
    })
    
    resetAI()
    onActionComplete?.()
  }

  const applyInsertBelow = () => {
    if (!editor || !aiStreamContent) return
    const { to } = editor.state.selection
    const insertText = `\n${aiStreamContent}`
    editor.chain().focus().setTextSelection(to).insertContent(insertText).run()
    
    const newFrom = to + 1
    const newTo = to + insertText.length
    requestAnimationFrame(() => {
      editor.chain().focus().setTextSelection({ from: newFrom, to: newTo }).run()
    })
    
    resetAI()
    onActionComplete?.()
  }

  const cancelAI = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    resetAI()
    onActionComplete?.()
  }

  const handleAI = async (customPrompt: string) => {
    if (!editor || !customPrompt.trim()) return

    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' ',
    )

    if (!selectedText) return

    try {
      setIsAILoading(true)
      setAiStreamContent('')
      setAiCompleted(false)
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
              setAiStreamContent(fullContent)
            } else if (data.type === 'done') {
              setAiCompleted(true)
              setIsAILoading(false)
            } else if (data.type === 'error') {
              throw new Error(data.data)
            }
          } catch {
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
      } else {
        console.error('AI 处理失败:', error)
      }
      setIsAILoading(false)
    } finally {
      abortControllerRef.current = null
    }
  }

  return {
    aiPrompt,
    setAiPrompt,
    isAILoading,
    aiStreamContent,
    aiCompleted,
    handleAI,
    resetAI,
    retryAI,
    applyReplace,
    applyInsertBelow,
    cancelAI,
    lastPromptRef,
  }
}
