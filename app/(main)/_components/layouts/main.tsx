'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '../mac-dock'
import { Header } from './header'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isCompositionPage = pathname === '/composition'

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* 头部 */}
      <Header />

      {/* 主体内容 */}
      <main
        className={`flex-1 h-auto pb-24 ${
          isCompositionPage
            ? 'overflow-hidden'
            : 'scrollbar-thin scrollbar-h-[10px] scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-neutral-50 dark:scrollbar-track-neutral-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full overflow-y-scroll'
        }`}
      >
        {children}
      </main>

      {/* 底部  风格侧边栏 */}
      <Sidebar />
    </div>
  )
}
