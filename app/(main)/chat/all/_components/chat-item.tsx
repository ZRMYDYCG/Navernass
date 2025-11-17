'use client'

import type { ChatItem } from '../types'
import { CheckSquare, Clock, MessageCircle, Pin, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTime } from '../_utils'

interface ChatItemProps {
  chat: ChatItem
  isSelectionMode: boolean
  isSelected: boolean
  onToggleSelect: (chatId: string) => void
  onNavigate: () => void
}

export function ChatItemComponent({
  chat,
  isSelectionMode,
  isSelected,
  onToggleSelect,
  onNavigate,
}: ChatItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors',
        isSelectionMode && 'cursor-pointer',
      )}
      onClick={() => {
        if (isSelectionMode) {
          onToggleSelect(chat.id)
        } else {
          onNavigate()
        }
      }}
    >
      {isSelectionMode && (
        <div className="flex-shrink-0">
          {isSelected
            ? (
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              )
            : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
        </div>
      )}

      <div className="flex items-start gap-3 flex-1 min-w-0">
        <MessageCircle className="w-5 h-5 text-gray-700 dark:text-gray-200 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {chat.title}
            </h3>
            {chat.isPinned && (
              <Pin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>
              {formatTime(chat.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
