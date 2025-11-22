'use client'

import type { LucideIcon } from 'lucide-react'
import { Book, Bot, LayoutGrid, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AppLogo } from '../app-logo'

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

export function Sidebar() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const isChatConversationPage = pathname.startsWith('/chat/') && pathname !== '/chat'

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

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
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] lg:hidden p-2.5 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors shadow-lg"
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
        className={`fixed left-0 top-0 h-screen border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-out z-[60] ${
          isMobileOpen 
            ? 'bg-white dark:bg-zinc-900 w-56 translate-x-0' 
            : `bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl ${isExpanded && !isChatConversationPage ? 'w-56' : 'w-16'} -translate-x-full lg:translate-x-0`
        }`}
        onMouseEnter={() => !isMobileOpen && !isChatConversationPage && setIsExpanded(true)}
        onMouseLeave={() => !isMobileOpen && !isChatConversationPage && setIsExpanded(false)}
      >
        <div className="flex flex-col h-full py-4">
          <div className={`flex items-center px-3 mb-8 transition-all duration-300 ${isExpanded || isMobileOpen ? 'justify-start' : 'justify-center'}`}>
            <AppLogo />
            {(isExpanded || isMobileOpen) && (
              <span className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200">
                Narraverse
              </span>
            )}
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
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
                  
                  {(isExpanded || isMobileOpen) && (
                    <span className="ml-3 text-sm font-medium whitespace-nowrap animate-in fade-in slide-in-from-left-1 duration-150">
                      {item.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
