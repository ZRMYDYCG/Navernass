'use client'

import type { LucideIcon } from 'lucide-react'
import { Book, Bot, ChevronLeft, ChevronRight, LayoutGrid, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AppLogo } from '../app-logo'
import { SettingsDialog } from './settings-dialog'
import { UserProfile } from './user-profile'

interface MenuItem {
  path: string
  label: string
  icon: LucideIcon
  exactMatch?: boolean
}

const menuItems: MenuItem[] = [
  { path: '/chat', label: 'Narraverse AI', icon: Bot, exactMatch: true },
  { path: '/novels', label: '我的小说', icon: Book },
  { path: '/trash', label: '回收站', icon: Trash2 },
]

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ onCollapsedChange }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  useEffect(() => {
    onCollapsedChange?.(isCollapsed)
  }, [isCollapsed, onCollapsedChange])

  const isActive = (item: MenuItem) => {
    if (item.exactMatch) {
      return pathname === item.path
    }
    return pathname === item.path || pathname.startsWith(`${item.path}/`)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] lg:hidden p-2.5 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition-colors shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`${
          isMobileOpen
            ? 'fixed left-0 top-0 h-screen border-r border-border bg-background w-56 translate-x-0 z-[60] transition-transform duration-300 ease-out'
            : `fixed left-0 top-0 h-screen border-r border-border bg-background ${
              isCollapsed ? 'w-16' : 'w-56'
            } -translate-x-full lg:translate-x-0 z-[60] transition-transform duration-300 ease-out lg:block`
        }`}
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-[70] w-7 h-7 rounded-full bg-card border-2 border-border text-muted-foreground hover:text-foreground hover:border-ring shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center cursor-pointer hidden lg:flex"
        >
          {isCollapsed
            ? (
                <ChevronRight className="w-4 h-4" />
              )
            : (
                <ChevronLeft className="w-4 h-4" />
              )}
        </button>

        <div className="flex flex-col h-full pt-4">
          <div className="flex items-center px-3 mb-8">
            <div className="flex items-center flex-1">
              <AppLogo />
              {(!isCollapsed || isMobileOpen) && (
                <span className="ml-3 text-lg font-semibold text-foreground whitespace-nowrap">
                  Narraverse
                </span>
              )}
            </div>
          </div>

          <nav className="flex-1 px-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item)

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`group relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="ml-3 text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <UserProfile
            isCollapsed={isCollapsed}
            isMobileOpen={isMobileOpen}
            onSettingsClick={() => setShowSettings(true)}
          />
        </div>

        <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      </aside>
    </>
  )
}
