'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useIsMobile } from '@/hooks/use-media-query'
import { Sidebar } from './sidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  const DEFAULT_DESKTOP_WIDTH = 224 // px (w-56)
  const MIN_DESKTOP_WIDTH = DEFAULT_DESKTOP_WIDTH
  const MAX_DESKTOP_WIDTH = 420

  const [desktopSidebarWidth, setDesktopSidebarWidth] = useState(DEFAULT_DESKTOP_WIDTH)
  const [isResizingSidebar, setIsResizingSidebar] = useState(false)
  const lastClientXRef = useRef<number | null>(null)

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isCompositionPage = pathname === '/composition'

  useEffect(() => {
    if (!isResizingSidebar) return

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

    const onMouseMove = (e: MouseEvent) => {
      if (lastClientXRef.current == null) {
        lastClientXRef.current = e.clientX
        return
      }
      const deltaX = e.clientX - lastClientXRef.current
      lastClientXRef.current = e.clientX

      setDesktopSidebarWidth(prev => clamp(prev + deltaX, MIN_DESKTOP_WIDTH, MAX_DESKTOP_WIDTH))
    }

    const onMouseUp = () => {
      setIsResizingSidebar(false)
      lastClientXRef.current = null
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    const prevUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.userSelect = prevUserSelect
    }
  }, [isResizingSidebar])

  return (
    <div className="flex h-screen bg-background transition-colors">
      <Sidebar
        desktopWidth={desktopSidebarWidth}
        isResizing={isResizingSidebar}
        onResizeStart={(clientX) => {
          setIsResizingSidebar(true)
          lastClientXRef.current = clientX
        }}
      />

      <div
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: isMobile ? 0 : (sidebarCollapsed ? 64 : desktopSidebarWidth) }}
      >
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
