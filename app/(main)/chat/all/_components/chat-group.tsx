'use client'

import type { ChatItem, DateGroup } from '../types'
import { Calendar } from 'lucide-react'
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
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground sticky top-0 bg-background py-2 -mx-4 px-4">
        <Calendar className="w-4 h-4" />
        <span>{group.label}</span>
        <span className="text-xs text-muted-foreground">
          {group.chats.length}
          {' '}
          个对话
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
