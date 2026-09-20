'use client'

import type { ChatItem, DateGroup } from '../types'
import { ChatItemComponent } from './chat-item'

interface ChatGroupProps {
  group: DateGroup
  onChatClick: (chatId: string) => void
}

export function ChatGroup({ group, onChatClick }: ChatGroupProps) {
  return (
    <div className="space-y-0.5">
      <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
        {group.label}
      </div>
      {group.chats.map((chat: ChatItem) => (
        <ChatItemComponent
          key={chat.id}
          chat={chat}
          onNavigate={() => onChatClick(chat.id)}
        />
      ))}
    </div>
  )
}
