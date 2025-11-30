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
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="bg-card rounded-xl shadow-lg border border-border transition-all flex flex-col min-h-[120px] max-w-4xl mx-auto focus-within:shadow-xl focus-within:border-primary/20">
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className={`relative w-full px-4 py-4 bg-transparent border-none outline-none text-foreground flex-1 overflow-y-auto break-words max-h-[180px] font-serif leading-relaxed ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          data-placeholder={disabled ? '等待对话创建...' : placeholder}
          suppressContentEditableWarning
        />

        <div className="px-4 pb-3 pt-1 flex justify-end">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleVoiceClick}
              className={`h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full ${
                isRecording ? 'text-destructive animate-pulse' : ''
              }`}
            >
              <Mic className="w-5 h-5" />
            </Button>

            <Button
              type="button"
              onClick={handleSend}
              disabled={isEmpty || disabled || isSending}
              size="icon"
              className={`h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed flex items-center justify-center transition-all rounded-lg shadow-sm ${
                isSending
                  ? 'disabled:opacity-100'
                  : 'disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none'
              }`}
              aria-busy={isSending}
            >
              {isSending
                ? (
                    <span className="block w-3 h-3 bg-current rounded-sm animate-pulse" />
                  )
                : (
                    <Send className="w-4 h-4" />
                  )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
