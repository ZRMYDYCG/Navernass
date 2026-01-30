'use client'

import type { LucideIcon } from 'lucide-react'
import { Bell, Book, Bot, Menu, Settings, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useIsMobile } from '@/hooks/use-media-query'
import { SettingsDialog } from './settings-dialog'
import { UserProfile } from './user-profile'

interface MenuItem {
  path?: string
  label: string
  icon: LucideIcon
  exactMatch?: boolean
  onClick?: () => void
}

export function Sidebar({
  desktopWidth,
  isResizing,
  onResizeStart,
}: {
  desktopWidth: number
  isResizing: boolean
  onResizeStart: (clientX: number) => void
}) {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  const [isCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const menuItems: MenuItem[] = [
    { path: '/chat', label: '创作助手', icon: Bot },
    { path: '/novels', label: '我的小说', icon: Book },
    { path: '/trash', label: '回收站', icon: Trash2 },
    { label: '设置', icon: Settings, onClick: () => setShowSettings(true), exactMatch: true },
  ]

  const bottomItem: MenuItem = { label: '产品动态', icon: Bell, onClick: () => location.assign('/chat/news') }

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  useEffect(() => {
    if (!isMobile && isMobileOpen) {
      setIsMobileOpen(false)
    }
  }, [isMobile, isMobileOpen])

  useEffect(() => {
    if (!isMobile) return
    setIsMobileOpen(false)
  }, [pathname, isMobile])

  const isActive = (item: MenuItem) => {
    if (!item.path) return false
    if (item.exactMatch) return pathname === item.path
    return pathname === item.path || pathname.startsWith(`${item.path}/`)
  }

  const sidebarWidth = isCollapsed ? 84 : desktopWidth
  const translateClass = isMobile ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
  const sidebarStyle = isMobile ? undefined : { width: sidebarWidth }

  return (
    <>
      {isMobile && (
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={isMobileOpen}
          data-sidebar-toggle
          onClick={() => setIsMobileOpen(prev => !prev)}
          className="fixed right-3 top-3 z-[70] h-10 w-10 rounded-full border border-border bg-background/90 shadow-lg backdrop-blur flex items-center justify-center text-foreground transition hover:bg-accent"
          title={isMobileOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      )}

      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 z-[50] bg-black/40 backdrop-blur-[1px]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen border-r border-sidebar-border bg-sidebar z-[60] ${isResizing ? '' : 'transition-all duration-300'} flex flex-col ${translateClass} ${isMobile ? 'w-[80vw] max-w-[320px] shadow-2xl' : ''}`}
        style={sidebarStyle}
      >
        <UserProfile compact isCollapsed={isCollapsed} isMobileOpen={isMobileOpen} onSettingsClick={() => setShowSettings(true)} />
        <nav className="px-2 flex flex-col gap-1 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            const classes = `group flex items-center rounded-none -mx-2 px-2 py-1.5 transition-colors ${active ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'}`

            return item.path
              ? (
                  <Link
                    key={item.label}
                    href={item.path}
                    className={classes}
                    onClick={() => {
                      if (isMobile) setIsMobileOpen(false)
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {!isCollapsed && <span className="ml-3 text-sm truncate">{item.label}</span>}
                  </Link>
                )
              : (
                  <button
                    key={item.label}
                    onClick={() => {
                      item.onClick?.()
                      if (isMobile) setIsMobileOpen(false)
                    }}
                    className={classes}
                  >
                    <Icon className="w-4 h-4" />
                    {!isCollapsed && <span className="ml-3 text-sm truncate">{item.label}</span>}
                  </button>
                )
          })}
        </nav>

        <div className="mt-auto pb-3">
          {(() => {
            const Icon = bottomItem.icon
            return (
              <button
                onClick={() => {
                  bottomItem.onClick?.()
                  if (isMobile) setIsMobileOpen(false)
                }}
                className={`group flex items-center rounded-none px-4 py-1.5 w-full text-left text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className="w-4 h-4" />
                {!isCollapsed && <span className="ml-3 text-sm truncate">{bottomItem.label}</span>}
              </button>
            )
          })()}
        </div>

        {!isMobile && (
          <div
            className={`absolute right-0 top-0 h-full w-1 ${isCollapsed ? 'hidden' : 'cursor-col-resize'}`}
            onMouseDown={(e) => {
              if (isCollapsed) return
              onResizeStart(e.clientX)
              e.preventDefault()
            }}
          />
        )}

        <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      </aside>
    </>
  )
}
