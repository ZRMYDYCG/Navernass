'use client'

import { ChatSidebar } from './_components/chat-sidebar'
import { ChatSidebarProvider, useChatSidebar } from './_components/chat-sidebar-provider'

function ChatLayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useChatSidebar()

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* 侧边栏 */}
      <ChatSidebar isOpen={isOpen} onClose={close} />

      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-800">
        {children}
      </main>
    </div>
  )
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatSidebarProvider>
      <ChatLayoutContent>{children}</ChatLayoutContent>
    </ChatSidebarProvider>
  )
}
