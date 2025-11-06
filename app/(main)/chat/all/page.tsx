'use client'

import type { ChatItem } from './types'
import { useCallback, useState } from 'react'
import { ChatListContent } from './_components/chat-list-content'
import { ChatListHeader } from './_components/chat-list-header'
import { filterChats, groupChatsByDate } from './_utils'
import { mockChats } from './config'

export default function AllChatsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChats, setSelectedChats] = useState<Set<string>>(() => new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const filteredChats = filterChats(mockChats, searchQuery)
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
    if (selectedChats.size === mockChats.length) {
      setSelectedChats(new Set())
    } else {
      setSelectedChats(new Set(mockChats.map((chat: ChatItem) => chat.id)))
    }
  }, [selectedChats.size])

  const handleBatchDelete = useCallback(() => {
    console.warn('删除选中项:', Array.from(selectedChats))
    setSelectedChats(new Set())
    setIsSelectionMode(false)
  }, [selectedChats])

  const handleBatchPin = useCallback(() => {
    console.warn('置顶选中项:', Array.from(selectedChats))
    setSelectedChats(new Set())
    setIsSelectionMode(false)
  }, [selectedChats])

  const handleBatchShare = useCallback(() => {
    console.warn('分享选中项:', Array.from(selectedChats))
    setSelectedChats(new Set())
    setIsSelectionMode(false)
  }, [selectedChats])

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
      />

      {/* 对话列表 */}
      <ChatListContent
        groupedChats={groupedChats}
        isSelectionMode={isSelectionMode}
        selectedChats={selectedChats}
        toggleChatSelection={toggleChatSelection}
      />
    </div>
  )
}
