'use client'

import type { DateGroup } from '../types'
import { MessageCircle } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UI_CONFIG } from '../config'
import { ChatGroup } from './chat-group'

interface ChatListContentProps {
  groupedChats: DateGroup[]
  isSelectionMode: boolean
  selectedChats: Set<string>
  toggleChatSelection: (chatId: string) => void
}

export function ChatListContent({
  groupedChats,
  isSelectionMode,
  selectedChats,
  toggleChatSelection,
}: ChatListContentProps) {
  if (groupedChats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
        <p>{UI_CONFIG.empty.message}</p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-6">
        {groupedChats.map(group => (
          <ChatGroup
            key={group.date}
            group={group}
            isSelectionMode={isSelectionMode}
            selectedChats={selectedChats}
            onToggleSelect={toggleChatSelection}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
