'use client'

import type { ChatHistoryData } from './chat-history-item'
import {
  AlertCircle,
  Bot,
  Edit3,
  PanelLeftClose,
} from 'lucide-react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { conversationsApi } from '@/lib/supabase/sdk'
import { cn } from '@/lib/utils'
import { ChatHistoryItem } from './chat-history-item'
import { useChatSidebar } from './chat-sidebar-provider'

const SKELETON_PLACEHOLDERS = ['placeholder-0', 'placeholder-1', 'placeholder-2', 'placeholder-3', 'placeholder-4', 'placeholder-5', 'placeholder-6', 'placeholder-7']

interface ChatSidebarProps {
  isOpen: boolean
  onClose?: () => void
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const { onTitleUpdate, updateConversationTitle } = useChatSidebar()
  const currentId = params?.id as string | undefined
  const isNewChatPage = pathname === '/chat'
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatHistoryData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 监听标题更新
  useEffect(() => {
    const unsubscribe = onTitleUpdate((conversationId, newTitle) => {
      setChatHistory(prev =>
        prev.map(chat =>
          chat.id === conversationId ? { ...chat, title: newTitle } : chat,
        ),
      )
    })

    return unsubscribe
  }, [onTitleUpdate])

  // 加载对话历史
  useEffect(() => {
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

    if (isOpen) {
      loadChatHistory()
    }
  }, [isOpen])

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`)
    if (onClose) {
      onClose()
    }
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
      updateConversationTitle(chatId, newTitle)
    } catch (error) {
      console.error('Failed to rename conversation:', error)
      throw error
    }
  }

  return (
    <TooltipProvider>
      <>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 lg:hidden cursor-pointer"
            onClick={onClose}
            aria-label="关闭侧边栏"
          />
        )}

        <aside
          className={cn(
            'fixed lg:relative top-0 left-0 h-full bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col',
            // 移动端：固定宽度 + transform
            'w-72 transition-transform duration-300',
            // 桌面端：宽度变化动画
            'lg:transition-all lg:duration-300',
            // 显示/隐藏控制
            isOpen
              ? 'translate-x-0 lg:w-72'
              : '-translate-x-full lg:w-0 lg:translate-x-0 lg:overflow-hidden',
          )}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-700 flex items-center justify-center">
                <Bot className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
              <span className="font-medium text-gray-800 dark:text-gray-100">Narraverse AI</span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
              onClick={onClose}
              aria-label="收起侧边栏"
            >
              <PanelLeftClose className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-3">
            <button
              type="button"
              onClick={() => router.push('/chat')}
              disabled={isNewChatPage}
              className="w-full flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors cursor-pointer disabled:text-gray-400 dark:disabled:text-gray-600 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:cursor-not-allowed"
            >
              <Edit3 className="w-4 h-4" />
              <span>新对话</span>
              <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">Ctrl K</span>
            </button>
          </div>

          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 group">
            <span>历史对话</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                  onClick={() => router.push('/chat/all')}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>查看全部对话</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <ScrollArea ref={scrollAreaRef} className="flex-1 relative">
            <div className="p-2 space-y-0.5 relative">
              {isLoading
                ? (
                    <div className="space-y-1">
                      {SKELETON_PLACEHOLDERS.map(key => (
                        <div key={key} className="flex items-center gap-2 px-3 py-2">
                          <Skeleton className="w-4 h-4 rounded-sm shrink-0 bg-gray-200 dark:bg-zinc-700" />
                          <Skeleton className="h-4 flex-1 bg-gray-200 dark:bg-zinc-700" />
                        </div>
                      ))}
                    </div>
                  )
                : chatHistory.length === 0
                  ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
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
        </aside>
      </>
    </TooltipProvider>
  )
}
