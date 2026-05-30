'use client'

import type { NovelMessage } from '@/lib/supabase/sdk/types'
import { MarkdownRenderer } from '@/app/(main)/chat/[id]/_components/markdown-renderer'
import { Avatar } from '@/components/ui/avatar'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: NovelMessage
  userAvatar?: string | null
}

function MessageBubble({ message, userAvatar }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const { t } = useI18n()

  const displayedContent = message.content

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
              alt={t('editor.rightPanel.generatedImageAlt')}
              className="max-w-full h-auto rounded-lg border border-border"
              style={{ maxHeight: '300px' }}
            />
          </div>,
        )
      } else if (parts[i]) {
        elements.push(
          <span key={i} className="text-foreground">
            <MarkdownRenderer content={parts[i]} />
          </span>,
        )
      }
    }

    return elements.length > 0 ? elements : <span className="text-foreground"><MarkdownRenderer content={content} /></span>
  }

  return (
    <div className={`flex gap-1.5 py-1 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {isUser && userAvatar && (
        <div className="shrink-0">
          <Avatar className="w-5 h-5 transition-transform duration-200 hover:scale-110">
            <img src={userAvatar} alt={t('editor.rightPanel.userAvatarAlt')} className="w-full h-full object-cover" />
          </Avatar>
        </div>
      )}

      <div
        className={cn(
          isUser
            ? 'max-w-[85%] sm:max-w-md lg:max-w-lg ml-auto flex justify-end'
            : 'w-full min-w-0 flex-1 flex justify-start',
        )}
      >
        <div
          className={cn(
            'rounded-lg px-2.5 py-1.5 text-[12px] bg-secondary text-foreground transition-all duration-200',
            isUser ? 'w-fit max-w-full' : 'w-full max-w-full',
          )}
        >
          {isUser
            ? (
                <p className="whitespace-pre-wrap break-words leading-snug text-[12px]">{message.content}</p>
              )
            : (
                <div className="text-foreground break-words break-all [&_.prose]:!text-[12px] [&_.prose]:!leading-snug [&_.prose_p]:!my-1 [&_.prose_p]:!text-[12px] [&_.prose_h1]:!text-[14px] [&_.prose_h1]:!my-1.5 [&_.prose_h2]:!text-[13px] [&_.prose_h2]:!my-1.5 [&_.prose_h3]:!text-[12px] [&_.prose_h3]:!my-1 [&_.prose_ul]:!my-1 [&_.prose_ol]:!my-1 [&_.prose_li]:!text-[12px] [&_.prose_li]:!my-0.5 [&_.prose_code]:!text-[10px] [&_.prose_pre]:!my-1.5 [&_.prose_pre]:!p-1.5 [&_.prose_pre]:!text-[10px] [&_.prose_blockquote]:!my-1.5 [&_.prose_blockquote]:!pl-3 [&_.prose_table]:!my-1.5 [&_.prose_th]:!text-[12px] [&_.prose_th]:!px-2 [&_.prose_th]:!py-1 [&_.prose_td]:!text-[12px] [&_.prose_td]:!px-2 [&_.prose_td]:!py-1">
                  {renderContent(displayedContent)}
                </div>
              )}
        </div>
      </div>
    </div>
  )
}

export { MessageBubble }
