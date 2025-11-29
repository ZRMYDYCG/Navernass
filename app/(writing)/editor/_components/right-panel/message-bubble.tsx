'use client'

import type { NovelMessage } from '@/lib/supabase/sdk/types'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { MarkdownRenderer } from '@/app/(main)/chat/[id]/_components/markdown-renderer'
import { Avatar } from '@/components/ui/avatar'

interface MessageBubbleProps {
  message: NovelMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)

  const displayedContent = message.content

  const avatarSrc = theme === 'dark' ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'

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
    <div className={`flex gap-2 py-1.5 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="shrink-0">
        {isAssistant && (
          <Avatar className="w-5 h-5 transition-transform duration-200 hover:scale-110">
            <img src={avatarSrc} alt="AI Avatar" className="w-full h-full object-cover" />
          </Avatar>
        )}
      </div>

      <div className={`flex-1 max-w-[85%] ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
        <div
          className={`rounded-lg px-2 py-1.5 text-xs transition-all duration-200 hover:shadow-sm ${
            isUser
              ? 'bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-gray-100'
              : 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
          }`}
        >
          {isUser
            ? (
                <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
              )
            : (
                <>
                  <div className="relative [&_.prose]:!text-xs [&_.prose]:!leading-relaxed [&_.prose_p]:!my-1 [&_.prose_p]:!text-xs [&_.prose_h1]:!text-sm [&_.prose_h1]:!my-1.5 [&_.prose_h2]:!text-xs [&_.prose_h2]:!my-1 [&_.prose_h3]:!text-xs [&_.prose_h3]:!my-1 [&_.prose_ul]:!my-1 [&_.prose_ol]:!my-1 [&_.prose_li]:!text-xs [&_.prose_li]:!my-0.5 [&_.prose_code]:!text-[10px] [&_.prose_pre]:!my-1 [&_.prose_pre]:!p-1.5 [&_.prose_pre]:!text-[10px] [&_.prose_blockquote]:!my-1 [&_.prose_blockquote]:!pl-2 [&_.prose_table]:!my-1 [&_.prose_th]:!text-xs [&_.prose_th]:!px-1 [&_.prose_th]:!py-0.5 [&_.prose_td]:!text-xs [&_.prose_td]:!px-1 [&_.prose_td]:!py-0.5">
                    <MarkdownRenderer content={displayedContent} />
                  </div>
                  <div className="mt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer"
                    >
                      复制
                      {copied && <Check className="w-3 h-3 text-emerald-500" />}
                    </button>
                  </div>
                </>
              )}
        </div>
      </div>
    </div>
  )
}
