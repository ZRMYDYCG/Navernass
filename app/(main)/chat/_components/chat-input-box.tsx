'use client'

import { Mic, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

interface ChatInputBoxProps {
  onSend?: (message: string) => void
  placeholder?: string
  disabled?: boolean
}

export function ChatInputBox({
  onSend,
  placeholder = '和 AI 一起创作你的小说世界...',
  disabled = false,
}: ChatInputBoxProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const checkEmpty = () => {
      if (editorRef.current) {
        const text = editorRef.current.textContent || ''
        const isContentEmpty = text.trim().length === 0
        setIsEmpty(isContentEmpty)

        if (isContentEmpty && editorRef.current.innerHTML !== '') {
          editorRef.current.innerHTML = ''
        }
      }
    }
    checkEmpty()

    if (editorRef.current) {
      const observer = new MutationObserver(checkEmpty)
      observer.observe(editorRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      })
      return () => observer.disconnect()
    }
  }, [])

  const handleInput = () => {
    // 输入时自动滚动到底部
    if (editorRef.current) {
      editorRef.current.scrollTop = editorRef.current.scrollHeight
    }
  }

  const handleSend = async () => {
    if (!editorRef.current || disabled || isSending) return
    const message = editorRef.current.textContent?.trim() || ''
    if (!message) return

    setIsSending(true)

    try {
      if (onSend) {
        await Promise.resolve(onSend(message))
      } else {
        router.push(`/chat/${Date.now()}`)
      }

      if (editorRef.current) {
        editorRef.current.innerHTML = ''
        editorRef.current.textContent = ''
        setIsEmpty(true)
      }
    } finally {
      if (editorRef.current) {
        // 重新聚焦到输入框
        editorRef.current.focus()
      }
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoiceClick = () => {
    setIsRecording(!isRecording)
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-[5px] shadow-lg border border-gray-200 dark:border-gray-700 transition-all flex flex-col min-h-[120px]">
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className={`relative w-full px-3 py-4 bg-transparent border-none outline-none text-gray-800 dark:text-gray-200 flex-1 overflow-y-auto break-words max-h-[180px] ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          data-placeholder={disabled ? '等待对话创建...' : placeholder}
          suppressContentEditableWarning
        />

        <div className="px-6 pb-3 pt-1 flex justify-end">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleVoiceClick}
              className={`h-9 w-9 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                isRecording ? 'text-red-500 dark:text-red-400 animate-pulse' : ''
              }`}
            >
              <Mic className="w-5 h-5" />
            </Button>

            <Button
              type="button"
              onClick={handleSend}
              disabled={isEmpty || disabled || isSending}
              size="icon"
              className={`h-9 w-9 bg-black text-white hover:bg-gray-900 dark:bg-black dark:text-white dark:hover:bg-gray-900 disabled:cursor-not-allowed flex items-center justify-center transition-colors ${
                isSending
                  ? 'disabled:bg-black disabled:text-white disabled:opacity-100'
                  : 'disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:opacity-60'
              }`}
              aria-busy={isSending}
            >
              {isSending
                ? (
                    <span className="block w-3 h-3 bg-white rounded-sm animate-pulse" />
                  )
                : (
                    <Send className="w-5 h-5" />
                  )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
