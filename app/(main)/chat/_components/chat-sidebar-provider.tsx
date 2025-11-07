'use client'

import type { ReactNode } from 'react'
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface ChatSidebarContextType {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
  // 标题更新通知
  updateConversationTitle: (conversationId: string, newTitle: string) => void
  // 注册标题更新监听器
  onTitleUpdate: (callback: (conversationId: string, newTitle: string) => void) => () => void
}

const ChatSidebarContext = createContext<ChatSidebarContextType | undefined>(undefined)

export function ChatSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth >= 1024
  })

  // 使用 ref 存储监听器，避免重新渲染
  const titleUpdateListeners = useRef<Set<(conversationId: string, newTitle: string) => void>>(new Set())

  useEffect(() => {
    const handleResize = () => {
      const isDesktopNow = window.innerWidth >= 1024
      setIsOpen((prevOpen) => {
        if (isDesktopNow) {
          return true
        }
        return prevOpen
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 更新对话标题，通知所有监听器
  const updateConversationTitle = useCallback((conversationId: string, newTitle: string) => {
    titleUpdateListeners.current.forEach((listener) => {
      listener(conversationId, newTitle)
    })
  }, [])

  // 注册标题更新监听器
  const onTitleUpdate = useCallback((callback: (conversationId: string, newTitle: string) => void) => {
    titleUpdateListeners.current.add(callback)
    // 返回取消订阅函数
    return () => {
      titleUpdateListeners.current.delete(callback)
    }
  }, [])

  const value = useMemo(() => ({
    isOpen,
    toggle: () => setIsOpen(prev => !prev),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    updateConversationTitle,
    onTitleUpdate,
  }), [isOpen, updateConversationTitle, onTitleUpdate])

  return (
    <ChatSidebarContext value={value}>
      {children}
    </ChatSidebarContext>
  )
}

export function useChatSidebar() {
  const context = use(ChatSidebarContext)
  if (context === undefined) {
    throw new Error('useChatSidebar must be used within a ChatSidebarProvider')
  }
  return context
}
