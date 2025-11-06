'use client'

import type { ChatItem } from './types'
import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChatListContent } from './_components/chat-list-content'
import { ChatListHeader } from './_components/chat-list-header'
import { filterChats, groupChatsByDate } from './_utils'
import { conversationsApi } from '@/lib/supabase/sdk'
import type { Conversation } from '@/lib/supabase/sdk/types'

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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
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
      <ChatListContent
        groupedChats={groupedChats}
        isSelectionMode={isSelectionMode}
        selectedChats={selectedChats}
        toggleChatSelection={toggleChatSelection}
        onChatClick={handleChatClick}
      />
    </div>
  )
}

