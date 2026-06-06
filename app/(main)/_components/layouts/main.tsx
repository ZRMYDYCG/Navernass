'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useIsMobile } from '@/hooks/use-media-query'
import { Sidebar } from './sidebar'
import { SidebarToggleContext } from './sidebar-toggle-context'

const SIDEBAR_WIDTH = 320
const HIDDEN_STORAGE_KEY = 'sidebar-hidden'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  const [isSidebarHidden, setIsSidebarHidden] = useState(false)

  // 从 localStorage 恢复折叠状态
  useEffect(() => {
    try {
      const savedHidden = localStorage.getItem(HIDDEN_STORAGE_KEY)
      if (savedHidden === '1') {
        setIsSidebarHidden(true)
      }
    } catch {
      // localStorage 不可用时忽略
    }
  }, [])

  const isCompositionPage = pathname === '/composition'

  // Ctrl/Cmd + B 切换侧边栏可见性
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return
      if (event.key.toLowerCase() !== 'b') return
      event.preventDefault()
      setIsSidebarHidden(prev => !prev)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarHidden(prev => {
      const next = !prev
      try {
        localStorage.setItem(HIDDEN_STORAGE_KEY, next ? '1' : '0')
      } catch {
        // localStorage 不可用时忽略
      }
      return next
    })
  }, [])

  const effectiveMarginLeft = isMobile || isSidebarHidden ? 0 : SIDEBAR_WIDTH

  return (
    <div className="flex h-screen bg-background transition-colors">
      <Sidebar
        desktopWidth={SIDEBAR_WIDTH}
        isHidden={isSidebarHidden}
        onToggleHidden={handleToggleSidebar}
      />

      <div
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: effectiveMarginLeft }}
      >
        <main
          className={`flex-1 h-auto ${
            isCompositionPage
              ? 'overflow-hidden'
              : 'scrollbar-thin scrollbar-h-[10px] scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-neutral-50 dark:scrollbar-track-neutral-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full overflow-y-auto'
          }`}
        >
          <SidebarToggleContext.Provider value={isSidebarHidden ? handleToggleSidebar : null}>
            {children}
          </SidebarToggleContext.Provider>
        </main>
      </div>
    </div>
  )
}
