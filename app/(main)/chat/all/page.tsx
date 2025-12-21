'use client'

import type { ChatItem } from './types'
import type { Conversation } from '@/lib/supabase/sdk/types'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { conversationsApi } from '@/lib/supabase/sdk'
import { ChatListContent } from './_components/chat-list-content'
import { ChatListHeader } from './_components/chat-list-header'
import { filterChats, groupChatsByDate } from './_utils'

export default function AllChatsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChats, setSelectedChats] = useState<Set<string>>(() => new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 加载对话列表
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true)
        const data = await conversationsApi.getList()
        setConversations(data)
      } catch (error) {
        console.error('Failed to load conversations:', error)
        setConversations([])
      } finally {
        setIsLoading(false)
      }
    }

    loadConversations()
  }, [])

  // 转换Conversation为ChatItem
  const chatItems: ChatItem[] = conversations.map(conv => ({
    id: conv.id,
    title: conv.title,
    createdAt: new Date(conv.created_at),
    updatedAt: new Date(conv.updated_at),
  }))

  const filteredChats = filterChats(chatItems, searchQuery)
  const groupedChats = groupChatsByDate(filteredChats)

  const toggleChatSelection = useCallback((chatId: string) => {
    setSelectedChats((prev) => {
      const newSelected = new Set(prev)
      if (newSelected.has(chatId)) {
        newSelected.delete(chatId)
      } else {
        newSelected.add(chatId)
      }
      return newSelected
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedChats.size === filteredChats.length) {
      setSelectedChats(new Set())
    } else {
      setSelectedChats(new Set(filteredChats.map((chat: ChatItem) => chat.id)))
    }
  }, [selectedChats.size, filteredChats])

  const handleBatchDelete = useCallback(async () => {
    try {
      const selectedIds = Array.from(selectedChats)
      // TODO: 实现批量删除API
      console.warn('删除选中项:', selectedIds)

      // 刷新列表
      const data = await conversationsApi.getList()
      setConversations(data)
      setSelectedChats(new Set())
      setIsSelectionMode(false)
    } catch (error) {
      console.error('Failed to delete chats:', error)
    }
  }, [selectedChats])

  const handleBatchPin = useCallback(async () => {
    try {
      const selectedIds = Array.from(selectedChats)
      // TODO: 实现批量置顶API
      console.warn('置顶选中项:', selectedIds)
      setSelectedChats(new Set())
      setIsSelectionMode(false)
    } catch (error) {
      console.error('Failed to pin chats:', error)
    }
  }, [selectedChats])

  const handleBatchShare = useCallback(async () => {
    try {
      const selectedIds = Array.from(selectedChats)
      // TODO: 实现批量分享API
      console.warn('分享选中项:', selectedIds)
      setSelectedChats(new Set())
      setIsSelectionMode(false)
    } catch (error) {
      console.error('Failed to share chats:', error)
    }
  }, [selectedChats])

  // 处理对话点击
  const handleChatClick = useCallback((chatId: string) => {
    router.push(`/chat/${chatId}`)
  }, [router])

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 头部 */}
      <ChatListHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSelectionMode={isSelectionMode}
        setIsSelectionMode={setIsSelectionMode}
        selectedChats={selectedChats}
        toggleSelectAll={toggleSelectAll}
        handleBatchDelete={handleBatchDelete}
        handleBatchPin={handleBatchPin}
        handleBatchShare={handleBatchShare}
        isLoading={isLoading}
        chatCount={conversations.length}
      />

      {/* 对话列表 */}
      {isLoading
        ? (
            <ScrollArea className="flex-1">
              <div className="max-w-5xl mx-auto p-6 space-y-8">
                {Array.from({ length: 3 }).map((_, groupIndex) => (
                  <div key={`skeleton-group-${groupIndex}`} className="space-y-4">
                    <Skeleton className="h-7 w-32" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {Array.from({ length: groupIndex === 0 ? 6 : 3 }).map((_, itemIndex) => (
                        <div
                          key={`skeleton-item-${groupIndex}-${itemIndex}`}
                          className="bg-card rounded-lg p-5 border border-border hover:shadow-md transition-shadow"
                        >
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <Skeleton className="h-6 w-4/5" />
                              <Skeleton className="w-9 h-9 rounded-md" />
                            </div>
                            <div className="space-y-2.5">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-[92%]" />
                              <Skeleton className="h-4 w-[85%]" />
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-border">
                              <Skeleton className="h-3.5 w-24" />
                              <Skeleton className="h-3.5 w-20" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )
        : (
            <ChatListContent
              groupedChats={groupedChats}
              isSelectionMode={isSelectionMode}
              selectedChats={selectedChats}
              toggleChatSelection={toggleChatSelection}
              onChatClick={handleChatClick}
            />
          )}
    </div>
  )
}
