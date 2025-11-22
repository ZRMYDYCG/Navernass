'use client'

import { usePathname } from 'next/navigation'
import { Header } from './header'
import { Sidebar } from './sidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isCompositionPage = pathname === '/composition'
  const isChatPage = pathname.includes('/chat')

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-900 transition-colors">
      <Sidebar />

      <div className="flex flex-col flex-1 lg:ml-16">
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
      </div>
    </div>
  )
}
