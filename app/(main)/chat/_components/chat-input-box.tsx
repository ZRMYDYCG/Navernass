'use client'

import { Mic, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

interface ChatInputBoxProps {
  onSend?: (message: string) => void
  placeholder?: string
}

export function ChatInputBox({
  onSend,
  placeholder = '和 AI 一起创作你的小说世界...',
}: ChatInputBoxProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
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

  const handleSend = () => {
    if (!editorRef.current) return
    const message = editorRef.current.textContent?.trim() || ''
    if (!message) return

    onSend ? onSend(message) : router.push(`/chat/${Date.now()}`)

    editorRef.current.innerHTML = ''
    editorRef.current.textContent = ''
    setIsEmpty(true)

    // 重新聚焦到输入框
    editorRef.current.focus()
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
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="relative w-full px-3 py-4 bg-transparent border-none outline-none text-gray-800 dark:text-gray-200 flex-1 overflow-y-auto break-words max-h-[180px]"
          data-placeholder={placeholder}
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
              disabled={isEmpty}
              size="icon"
              className="h-9 w-9 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
