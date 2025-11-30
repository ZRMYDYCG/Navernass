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
          className="w-full px-2.5 py-2 hover:bg-stone-100 dark:hover:bg-zinc-800/50 rounded-lg border border-transparent hover:border-stone-200/50 dark:hover:border-zinc-700 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
        >
          <CircularProgress messageCount={conversation.message_count || 0} />
          <div className="flex-1 min-w-0 text-xs text-[#333333] dark:text-zinc-300 truncate group-hover:text-black dark:group-hover:text-zinc-100 font-medium">
            {conversation.title || '无标题对话'}
          </div>
          <div className="text-[10px] text-stone-400 dark:text-zinc-500 flex-shrink-0 group-hover:text-stone-500 dark:group-hover:text-zinc-400">
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
