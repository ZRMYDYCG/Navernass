'use client'

import type { DateGroup } from '../types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n } from '@/hooks/use-i18n'
import { ChatGroup } from './chat-group'

interface ChatListContentProps {
  groupedChats: DateGroup[]
  onChatClick: (chatId: string) => void
}

export function ChatListContent({ groupedChats, onChatClick }: ChatListContentProps) {
  const { t } = useI18n()

  if (groupedChats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-xs font-serif italic">
        {t('chat.all.toolbar.notFound')}
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-3">
        {groupedChats.map(group => (
          <ChatGroup
            key={group.date}
            group={group}
            onChatClick={onChatClick}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
