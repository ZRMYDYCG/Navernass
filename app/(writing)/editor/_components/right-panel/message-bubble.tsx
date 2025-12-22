'use client'

import type { NovelMessage } from '@/lib/supabase/sdk/types'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { MarkdownRenderer } from '@/app/(main)/chat/[id]/_components/markdown-renderer'
import { Avatar } from '@/components/ui/avatar'

interface MessageBubbleProps {
  message: NovelMessage
  streamingMessageId?: string | null
}

export function MessageBubble({ message, streamingMessageId }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)
  const isStreaming = streamingMessageId === message.id

  const displayedContent = message.content

  const avatarSrc = theme === 'dark' ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'

  const renderContent = (content: string) => {
    const imageRegex = /\[图片\]\((https?:\/\/[^\s)]+)\)/g
    const parts = content.split(imageRegex)
    const elements: React.ReactNode[] = []

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        elements.push(
          <div key={i} className="my-2">
            <img
              src={parts[i]}
              alt="Generated image"
              className="max-w-full h-auto rounded-lg border border-border"
              style={{ maxHeight: '300px' }}
            />
          </div>
        )
      } else if (parts[i]) {
        elements.push(
          <MarkdownRenderer key={i} content={parts[i]} />
        )
      }
    }

    return elements.length > 0 ? elements : <MarkdownRenderer content={content} />
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayedContent)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 1500)
    } catch (error) {
      console.error('Failed to copy message', error)
    }
  }

  return (
    <div className={`flex gap-1.5 py-1 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="shrink-0">
        {isAssistant && (
          <Avatar className="w-5 h-5 transition-transform duration-200 hover:scale-110">
            <img src={avatarSrc} alt="AI Avatar" className="w-full h-full object-cover" />
          </Avatar>
        )}
      </div>

      <div className={`flex-1 max-w-[85%] sm:max-w-md lg:max-w-lg ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
        <div
          className={`rounded-lg px-2.5 py-1.5 text-[12px] transition-all duration-200 ${
            isUser
              ? 'bg-secondary text-foreground'
              : isStreaming
                ? 'bg-card text-foreground'
                : 'bg-card text-foreground border border-border shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
          }`}
        >
          {isUser
            ? (
                <p className="whitespace-pre-wrap break-words leading-snug text-[12px]">{message.content}</p>
              )
            : (
                <>
                  <div className="relative break-words break-all [&_.prose]:!text-[12px] [&_.prose]:!leading-snug [&_.prose_p]:!my-1 [&_.prose_p]:!text-[12px] [&_.prose_h1]:!text-[14px] [&_.prose_h1]:!my-1.5 [&_.prose_h2]:!text-[13px] [&_.prose_h2]:!my-1.5 [&_.prose_h3]:!text-[12px] [&_.prose_h3]:!my-1 [&_.prose_ul]:!my-1 [&_.prose_ol]:!my-1 [&_.prose_li]:!text-[12px] [&_.prose_li]:!my-0.5 [&_.prose_code]:!text-[10px] [&_.prose_pre]:!my-1.5 [&_.prose_pre]:!p-1.5 [&_.prose_pre]:!text-[10px] [&_.prose_blockquote]:!my-1.5 [&_.prose_blockquote]:!pl-3 [&_.prose_table]:!my-1.5 [&_.prose_th]:!text-[12px] [&_.prose_th]:!px-2 [&_.prose_th]:!py-1 [&_.prose_td]:!text-[12px] [&_.prose_td]:!px-2 [&_.prose_td]:!py-1">
                    {renderContent(displayedContent)}
                  </div>
                  {!isStreaming && (
                    <div className="mt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-colors"
                      >
                        复制
                        {copied && <Check className="w-3 h-3 text-emerald-500" />}
                      </button>
                    </div>
                  )}
                </>
              )}
        </div>
      </div>
    </div>
  )
}
