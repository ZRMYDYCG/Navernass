'use client'

import type { ChatHistoryData } from './chat-history-item'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/hooks/use-i18n'
import { conversationsApi } from '@/lib/supabase/sdk'
import { useChatStore } from '@/store'
import { cn } from '@/lib/utils'
import { ChatHistoryItem } from './chat-history-item'

const SKELETON_PLACEHOLDERS = ['placeholder-0', 'placeholder-1', 'placeholder-2', 'placeholder-3', 'placeholder-4', 'placeholder-5', 'placeholder-6', 'placeholder-7']

// 首屏拉 30 条；返回 30 说明还有更多，底部展示"查看更多"
const INITIAL_PAGE_SIZE = 30

interface ChatHistoryPopoverProps {
  className?: string
  scrollAreaClassName?: string
}

export function ChatHistoryPopover({ className, scrollAreaClassName }: ChatHistoryPopoverProps) {
  const router = useRouter()
  const params = useParams()
  const currentId = params?.id as string | undefined
  const { t } = useI18n()
  const [isPinnedSectionOpen, setIsPinnedSectionOpen] = useState(true)
  const [chatHistory, setChatHistory] = useState<ChatHistoryData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const streamingConversationId = useChatStore(s => s.chat.streamingConversationId)

  const loadChatHistory = async () => {
    try {
      setIsLoading(true)
      const conversations = await conversationsApi.getRecent(INITIAL_PAGE_SIZE)

      const historyData: ChatHistoryData[] = conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        isPinned: conv.is_pinned || false,
        createdAt: new Date(conv.created_at),
      }))

      setChatHistory(historyData)
    } catch (error) {
      console.error('Failed to load chat history:', error)
      setChatHistory([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadChatHistory()
  }, [])

  const { pinnedChats, recentChats, hasMore } = useMemo(() => {
    const pinned: ChatHistoryData[] = []
    const recent: ChatHistoryData[] = []
    for (const chat of chatHistory) {
      if (chat.isPinned) {
        pinned.push(chat)
      } else {
        recent.push(chat)
      }
    }
    return {
      pinnedChats: pinned,
      recentChats: recent,
      hasMore: chatHistory.length >= INITIAL_PAGE_SIZE,
    }
  }, [chatHistory])

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`)
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      await conversationsApi.delete(chatId)
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId))

      if (currentId === chatId) {
        router.push('/chat')
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  const handleTogglePin = async (chatId: string, isPinned: boolean) => {
    try {
      await conversationsApi.update({ id: chatId, is_pinned: !isPinned })
      setChatHistory(prev =>
        prev.map(chat => (chat.id === chatId ? { ...chat, isPinned: !isPinned } : chat)),
      )
    } catch (error) {
      console.error('Failed to toggle pin:', error)
    }
  }

  const handleRename = async (chatId: string, newTitle: string) => {
    try {
      await conversationsApi.update({ id: chatId, title: newTitle })
      setChatHistory(prev =>
        prev.map(chat => (chat.id === chatId ? { ...chat, title: newTitle } : chat)),
      )
    } catch (error) {
      console.error('Failed to rename conversation:', error)
      throw error
    }
  }

  const renderItem = (chat: ChatHistoryData) => (
    <ChatHistoryItem
      key={chat.id}
      chat={chat}
      isActive={currentId === chat.id}
      isStreaming={streamingConversationId === chat.id}
      onChatClick={handleChatClick}
      onDelete={handleDeleteChat}
      onTogglePin={handleTogglePin}
      onRename={handleRename}
    />
  )

  return (
    <div className={cn('flex flex-col min-h-0', className)}>
      <ScrollArea className={cn('flex-1 min-h-0', scrollAreaClassName)}>
        <div className="space-y-0.5">
          {isLoading
            ? (
                <div className="space-y-2">
                  {SKELETON_PLACEHOLDERS.map(key => (
                    <div key={key} className="flex items-center gap-2 px-3 py-2">
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              )
            : chatHistory.length === 0
              ? (
                  <div className="min-h-[200px] flex items-center justify-center text-muted-foreground text-xs font-serif italic">
                    {t('chat.historyPopover.empty')}
                  </div>
                )
              : (
                  <>
                    {pinnedChats.length > 0 && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setIsPinnedSectionOpen(prev => !prev)}
                          className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          aria-expanded={isPinnedSectionOpen}
                        >
                          {isPinnedSectionOpen
                            ? <ChevronDown className="h-3.5 w-3.5" />
                            : <ChevronRight className="h-3.5 w-3.5" />}
                          <span>{t('chat.historyPopover.section.pinned')}</span>
                          <span className="ml-1 text-[10px] text-muted-foreground/60">
                            {pinnedChats.length}
                          </span>
                        </button>
                        {isPinnedSectionOpen && (
                          <div className="space-y-0.5">
                            {pinnedChats.map(renderItem)}
                          </div>
                        )}
                      </div>
                    )}

                    {recentChats.length > 0 && (
                      <div className="pt-1">
                        {pinnedChats.length > 0 && (
                          <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                            {t('chat.historyPopover.section.recent')}
                          </div>
                        )}
                        <div className="space-y-0.5">
                          {recentChats.map(renderItem)}
                        </div>
                      </div>
                    )}

                    {hasMore && (
                      <div className="pt-2 pb-1 flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                          onClick={() => router.push('/chat/all')}
                        >
                          {t('chat.historyPopover.viewMore')}
                        </Button>
                      </div>
                    )}
                  </>
                )}
        </div>
      </ScrollArea>
    </div>
  )
}
