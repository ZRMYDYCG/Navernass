'use client'

import type { ChatHistoryData } from './chat-history-item'
import { Bot, Edit3, List } from 'lucide-react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { conversationsApi } from '@/lib/supabase/sdk'
import { ChatHistoryItem } from './chat-history-item'

const SKELETON_PLACEHOLDERS = ['placeholder-0', 'placeholder-1', 'placeholder-2', 'placeholder-3', 'placeholder-4', 'placeholder-5', 'placeholder-6', 'placeholder-7']

export function ChatHistoryPopover() {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const currentId = params?.id as string | undefined
  const isNewChatPage = pathname === '/chat'
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatHistoryData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadChatHistory = async () => {
    try {
      setIsLoading(true)
      const conversations = await conversationsApi.getRecent(50)

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
        prev.map(chat =>
          chat.id === chatId ? { ...chat, isPinned: !isPinned } : chat,
        ).sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1
          if (!a.isPinned && b.isPinned) return 1
          return b.createdAt.getTime() - a.createdAt.getTime()
        }),
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

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center">
            <Bot className="w-4 h-4 text-foreground" />
          </div>
          <span className="font-medium text-sm text-foreground font-serif">历史对话</span>
        </div>
      </div>

      <div className="p-3">
        <Button
          variant="ghost"
          onClick={() => router.push('/chat')}
          disabled={isNewChatPage}
          className="w-full flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:shadow-sm transition-all duration-200 cursor-pointer disabled:text-muted-foreground disabled:shadow-none disabled:bg-transparent disabled:cursor-not-allowed group"
        >
          <Edit3 className="w-4 h-4 group-hover:text-foreground transition-colors" />
          <span className="font-serif">新对话</span>
        </Button>
      </div>

      <div className="px-4 py-2 text-xs font-medium text-muted-foreground flex items-center gap-2 group font-serif uppercase tracking-wider">
        <span>历史对话</span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-auto text-muted-foreground/70 hover:text-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer h-6 w-6"
          onClick={() => router.push('/chat/all')}
        >
          <List className="w-3.5 h-3.5" />
        </Button>
      </div>

      <ScrollArea className="max-h-[400px]">
        <div className="p-2 space-y-0.5">
          {isLoading
            ? (
                <div className="space-y-2">
                  {SKELETON_PLACEHOLDERS.map(key => (
                    <div key={key} className="flex items-center gap-2 px-3 py-2">
                      <Skeleton className="w-4 h-4 rounded-sm shrink-0" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              )
            : chatHistory.length === 0
              ? (
                  <div className="text-center py-8 text-muted-foreground text-xs font-serif italic">
                    还没有对话历史
                  </div>
                )
              : (
                  chatHistory.map(chat => (
                    <ChatHistoryItem
                      key={chat.id}
                      chat={chat}
                      isActive={currentId === chat.id}
                      isMenuOpen={menuOpenId === chat.id}
                      onChatClick={handleChatClick}
                      onMenuOpenChange={isOpen => setMenuOpenId(isOpen ? chat.id : null)}
                      onDelete={handleDeleteChat}
                      onTogglePin={handleTogglePin}
                      onRename={handleRename}
                    />
                  ))
                )}
        </div>
      </ScrollArea>
    </TooltipProvider>
  )
}
