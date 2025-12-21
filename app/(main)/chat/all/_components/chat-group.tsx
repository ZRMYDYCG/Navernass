'use client'

import type { ChatItem, DateGroup } from '../types'
import { ROUTES } from '../config'
import { ChatItemComponent } from './chat-item'

interface ChatGroupProps {
  group: DateGroup
  isSelectionMode: boolean
  selectedChats: Set<string>
  onToggleSelect: (chatId: string) => void
  onChatClick: (chatId: string) => void
}

export function ChatGroup({
  group,
  isSelectionMode,
  selectedChats,
  onToggleSelect,
}: ChatGroupProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-foreground sticky top-0 bg-background py-2">
        <span>{group.label}</span>
        <span className="ml-2 text-xs text-muted-foreground">
          ({group.chats.length})
        </span>
      </div>

      <div className="space-y-1">
        {group.chats.map((chat: ChatItem) => (
          <ChatItemComponent
            key={chat.id}
            chat={chat}
            isSelectionMode={isSelectionMode}
            isSelected={selectedChats.has(chat.id)}
            onToggleSelect={onToggleSelect}
            onNavigate={() => {
              if (!isSelectionMode) {
                window.location.href = ROUTES.chatDetail(chat.id)
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}
