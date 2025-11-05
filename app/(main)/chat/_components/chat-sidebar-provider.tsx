'use client'

import type { ReactNode } from 'react'
import { createContext, use, useEffect, useMemo, useState } from 'react'

interface ChatSidebarContextType {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

const ChatSidebarContext = createContext<ChatSidebarContextType | undefined>(undefined)

export function ChatSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth >= 1024
  })

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

  const value = useMemo(() => ({
    isOpen,
    toggle: () => setIsOpen(prev => !prev),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }), [isOpen])

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
