'use client'

import type { ChatItem } from './types'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n, useLocale } from '@/hooks/use-i18n'
import { conversationsApi } from '@/lib/supabase/sdk'
import { ChatListContent } from './_components/chat-list-content'
import { ChatListHeader } from './_components/chat-list-header'
import { filterChats, groupChatsByDate } from './_utils'

export default function AllChatsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [conversations, setConversations] = useState<ChatItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { t } = useI18n()
  const { locale } = useLocale()

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true)
        const data = await conversationsApi.getList()
        setConversations(
          data.map(conv => ({
            id: conv.id,
            title: conv.title,
            createdAt: new Date(conv.created_at),
            updatedAt: new Date(conv.updated_at),
            isPinned: conv.is_pinned,
          })),
        )
      } catch (error) {
        console.error('Failed to load conversations:', error)
        setConversations([])
      } finally {
        setIsLoading(false)
      }
    }

    loadConversations()
  }, [])

  const groupedChats = useMemo(() => {
    const filtered = filterChats(conversations, searchQuery)
    return groupChatsByDate(filtered, {
      locale: locale === 'zh-CN' ? 'zh-CN' : 'en-US',
      todayLabel: t('chat.all.dateGroup.today'),
      yesterdayLabel: t('chat.all.dateGroup.yesterday'),
    })
  }, [conversations, searchQuery, locale, t])

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`)
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatListHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        chatCount={conversations.length}
      />

      {isLoading
        ? (
            <div className="flex-1 p-2 space-y-3">
              {Array.from({ length: 3 }).map((_, groupIndex) => (
                <div key={`skeleton-group-${groupIndex}`} className="space-y-1">
                  <Skeleton className="h-4 w-16 mx-3" />
                  <div className="space-y-0.5">
                    {Array.from({ length: groupIndex === 0 ? 6 : 3 }).map((_, itemIndex) => (
                      <div
                        key={`skeleton-item-${groupIndex}-${itemIndex}`}
                        className="flex items-center gap-3 px-3 py-2"
                      >
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        : (
            <ChatListContent
              groupedChats={groupedChats}
              onChatClick={handleChatClick}
            />
          )}
    </div>
  )
}
