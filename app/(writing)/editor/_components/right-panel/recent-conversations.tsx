'use client'

import type { NovelConversation } from '@/lib/supabase/sdk'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { CircularProgress } from './circular-progress'

interface RecentConversationsProps {
  conversations: NovelConversation[]
  onSelect: (conversation: NovelConversation) => void
}

export function RecentConversations({ conversations, onSelect }: RecentConversationsProps) {
  const recentConversations = conversations
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3)

  if (recentConversations.length === 0) {
    return null
  }

  return (
    <div className="space-y-1">
      {recentConversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation)}
          className="w-full px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded border border-gray-200 dark:border-gray-600 transition-colors text-left flex items-center gap-2 cursor-pointer"
        >
          <CircularProgress messageCount={conversation.message_count || 0} />
          <div className="flex-1 min-w-0 text-xs text-gray-700 dark:text-gray-300 truncate">
            {conversation.title || '无标题对话'}
          </div>
          <div className="text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0">
            {formatDistanceToNow(new Date(conversation.updated_at), {
              addSuffix: true,
              locale: zhCN,
            })}
          </div>
        </button>
      ))}
    </div>
  )
}
