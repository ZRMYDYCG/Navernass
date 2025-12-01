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
    <div className={`flex gap-1.5 py-1 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="shrink-0">
        {isAssistant && (
          <Avatar className="w-5 h-5 transition-transform duration-200 hover:scale-110">
            <img src={avatarSrc} alt="AI Avatar" className="w-full h-full object-cover" />
          </Avatar>
        )}
      </div>

      <div className={`flex-1 max-w-[85%] ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
        <div
          className={`rounded-lg px-2.5 py-1.5 text-[12px] transition-all duration-200 ${
            isUser
              ? 'bg-stone-100 dark:bg-zinc-800 text-[#333333] dark:text-zinc-100'
              : 'bg-white dark:bg-zinc-800/80 text-[#333333] dark:text-zinc-100 border border-stone-200/50 dark:border-zinc-700/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
          }`}
        >
          {isUser
            ? (
                <p className="whitespace-pre-wrap break-words leading-snug text-[12px]">{message.content}</p>
              )
            : (
                <>
                  <div className="relative [&_.prose]:!text-[12px] [&_.prose]:!leading-snug [&_.prose_p]:!my-1 [&_.prose_p]:!text-[12px] [&_.prose_h1]:!text-[14px] [&_.prose_h1]:!my-1.5 [&_.prose_h2]:!text-[13px] [&_.prose_h2]:!my-1.5 [&_.prose_h3]:!text-[12px] [&_.prose_h3]:!my-1 [&_.prose_ul]:!my-1 [&_.prose_ol]:!my-1 [&_.prose_li]:!text-[12px] [&_.prose_li]:!my-0.5 [&_.prose_code]:!text-[10px] [&_.prose_pre]:!my-1.5 [&_.prose_pre]:!p-1.5 [&_.prose_pre]:!text-[10px] [&_.prose_blockquote]:!my-1.5 [&_.prose_blockquote]:!pl-3 [&_.prose_table]:!my-1.5 [&_.prose_th]:!text-[12px] [&_.prose_th]:!px-2 [&_.prose_th]:!py-1 [&_.prose_td]:!text-[12px] [&_.prose_td]:!px-2 [&_.prose_td]:!py-1">
                    <MarkdownRenderer content={displayedContent} />
                  </div>
                  <div className="mt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] text-stone-400 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors"
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
