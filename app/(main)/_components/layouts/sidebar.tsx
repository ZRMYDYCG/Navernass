'use client'

import type { LucideIcon } from 'lucide-react'
import { Bell, Book, Bot, LayoutDashboard, Menu, PencilLine, Search, Settings, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChatHistoryPopover } from '@/app/(main)/chat/_components/chat-history-popover'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { useI18n } from '@/hooks/use-i18n'
import { useIsMobile } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { SearchDialog } from './search-dialog'
import { SettingsDialog } from './settings-dialog'
import { UserProfile } from './user-profile'

interface MenuItem {
  path?: string
  label: string
  icon: LucideIcon
  exactMatch?: boolean
  onClick?: () => void
  shortcut?: string[]
  disabled?: boolean
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
  const router = useRouter()
  const isMobile = useIsMobile()
  const isNewChatPage = pathname === '/chat'

  const [isCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const [prevPathname, setPrevPathname] = useState(pathname)

  if (!isMobile && isMobileOpen) {
    setIsMobileOpen(false)
  }

  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    if (isMobile && isMobileOpen) {
      setIsMobileOpen(false)
    }
  }

  const { t } = useI18n()

  const menuItems: MenuItem[] = [
    { label: t('common.search'), icon: Search, onClick: () => setShowSearch(true), exactMatch: true, shortcut: ['Ctrl', 'K'] },
    { path: '/workspace', label: t('nav.workspace'), icon: LayoutDashboard, exactMatch: true },
    { label: t('nav.newChat'), icon: PencilLine, onClick: () => router.push('/chat'), exactMatch: true, disabled: isNewChatPage },
    { path: '/chat', label: t('nav.chat'), icon: Bot, exactMatch: true },
    { path: '/novels', label: t('nav.novels'), icon: Book },
    { path: '/trash', label: t('nav.trash'), icon: Trash2 },
    { label: t('nav.settings'), icon: Settings, onClick: () => setShowSettings(true), exactMatch: true },
  ]

  const bottomItem: MenuItem = { path: '/chat/news', label: t('nav.news'), icon: Bell, exactMatch: true }

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return
      if (event.key.toLowerCase() !== 'k') return
      event.preventDefault()
      setShowSearch(true)
      if (isMobile) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobile])

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
          aria-label={isMobileOpen ? t('main.sidebar.closeSidebar') : t('main.sidebar.openSidebar')}
          aria-expanded={isMobileOpen}
          data-sidebar-toggle
          onClick={() => setIsMobileOpen(prev => !prev)}
          className={cn(
            'fixed right-3 top-3 z-[70] h-10 w-10 rounded-full border border-sidebar-border bg-sidebar/90 shadow-lg backdrop-blur flex items-center justify-center text-sidebar-foreground transition hover:bg-sidebar-accent',
          )}
          title={isMobileOpen ? t('main.sidebar.closeSidebar') : t('main.sidebar.openSidebar')}
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      )}

      {isMobile && isMobileOpen && (
        <div
          className={cn('fixed inset-0 z-[50] bg-black/40 backdrop-blur-[1px]')}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen border-r border-sidebar-border bg-sidebar z-[60] flex flex-col',
          !isResizing && 'transition-all duration-300',
          translateClass,
          isMobile && 'w-[80vw] max-w-[320px] shadow-2xl',
        )}
        style={sidebarStyle}
      >
        <UserProfile compact isCollapsed={isCollapsed} isMobileOpen={isMobileOpen} onSettingsClick={() => setShowSettings(true)} />
        <nav className="px-2 flex flex-col gap-1 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)

            const classes = cn(
              'group flex items-center rounded-sm -mx-2 px-3 py-1.5 transition-colors relative',
              active
                ? 'text-sidebar-foreground bg-sidebar-accent/70 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[2px] before:rounded-full before:bg-sidebar-primary'
                : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
              item.disabled && 'cursor-not-allowed opacity-40 pointer-events-none',
            )

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
                    <Icon className="w-[15px] h-[15px]" />
                    {!isCollapsed && <span className="ml-3 text-[13px] truncate">{item.label}</span>}
                    {!isCollapsed && item.shortcut?.length && (
                      <span className="ml-auto pl-3">
                        <KbdGroup>
                          {item.shortcut.map(key => (
                            <Kbd key={key}>{key}</Kbd>
                          ))}
                        </KbdGroup>
                      </span>
                    )}
                  </Link>
                )
              : (
                  <button
                    key={item.label}
                    onClick={() => {
                      item.onClick?.()
                      if (isMobile) setIsMobileOpen(false)
                    }}
                    disabled={item.disabled}
                    className={classes}
                  >
                    <Icon className="w-[15px] h-[15px]" />
                    {!isCollapsed && <span className="ml-3 text-[13px] truncate">{item.label}</span>}
                    {!isCollapsed && item.shortcut?.length && (
                      <span className="ml-auto pl-3">
                        <KbdGroup>
                          {item.shortcut.map(key => (
                            <Kbd key={key}>{key}</Kbd>
                          ))}
                        </KbdGroup>
                      </span>
                    )}
                  </button>
                )
          })}
        </nav>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatHistoryPopover className="h-full" scrollAreaClassName="h-full min-h-0" />
        </div>

        <div className="mt-auto">
          {(() => {
            const Icon = bottomItem.icon
            return (
              <Link
                href={bottomItem.path!}
                onClick={() => {
                  if (isMobile) setIsMobileOpen(false)
                }}
                className={cn(
                  'group flex items-center rounded-sm px-3 py-1.5 w-full text-left text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                  isCollapsed && 'justify-center',
                )}
              >
                <Icon className="w-[15px] h-[15px]" />
                {!isCollapsed && <span className="ml-3 text-[13px] truncate">{bottomItem.label}</span>}
              </Link>
            )
          })()}
        </div>

        {!isMobile && (
          <div
            className={cn(
              'absolute right-0 top-0 h-full w-1',
              isCollapsed ? 'hidden' : 'cursor-col-resize',
            )}
            onMouseDown={(e) => {
              if (isCollapsed) return
              onResizeStart(e.clientX)
              e.preventDefault()
            }}
          />
        )}

        <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
        <SearchDialog open={showSearch} onOpenChange={setShowSearch} />
      </aside>
    </>
  )
}
