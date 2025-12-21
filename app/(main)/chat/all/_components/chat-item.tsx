'use client'

import type { ChatItem } from '../types'
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
        'flex items-center justify-between p-3 rounded border border-border hover:bg-accent transition-colors cursor-pointer',
        isSelected && 'bg-accent',
      )}
      onClick={() => {
        if (isSelectionMode) {
          onToggleSelect(chat.id)
        } else {
          onNavigate()
        }
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {isSelectionMode && (
          <div className="w-4 h-4 rounded border border-border bg-background" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground truncate">
              {chat.title}
            </h3>
            {chat.isPinned && (
              <span className="text-xs text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                置顶
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {formatTime(chat.createdAt)}
          </div>
        </div>
      </div>
    </div>
  )
}
