'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '../mac-dock'
import { Header } from './header'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isCompositionPage = pathname === '/composition'
  const isChatPage = pathname.includes('/chat')

  const isNewChatPage = pathname === '/chat'
  const shouldShowSidebar = isNewChatPage || !isChatPage

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-zinc-900 transition-colors">
      {!isChatPage && <Header />}

      <main
        className={`flex-1 h-auto ${
          isCompositionPage
            ? 'overflow-hidden'
            : 'scrollbar-thin scrollbar-h-[10px] scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-neutral-50 dark:scrollbar-track-neutral-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full overflow-y-auto'
        }`}
      >
        {children}
      </main>

      {shouldShowSidebar && <Sidebar />}
    </div>
  )
}
