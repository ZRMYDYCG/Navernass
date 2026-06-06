'use client'

import type { ChatItem } from '../types'
import { useLocale } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { formatTime } from '../_utils'

interface ChatItemProps {
  chat: ChatItem
  onNavigate: () => void
}

export function ChatItemComponent({ chat, onNavigate }: ChatItemProps) {
  const { locale } = useLocale()

  return (
    <button
      type="button"
      onClick={onNavigate}
      className={cn(
        'group w-full flex items-center gap-3 px-3 py-2 rounded-md text-left',
        'hover:bg-sidebar-accent transition-colors cursor-pointer',
      )}
    >
      <span className="flex-1 min-w-0 text-sm text-foreground truncate">
        {chat.title}
      </span>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {formatTime(chat.createdAt, locale === 'zh-CN' ? 'zh-CN' : 'en-US')}
      </span>
    </button>
  )
}
