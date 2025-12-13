'use client'

import { Copy, X, ChevronLeft, ChevronRight, Circle, CircleDot } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { toast } from 'sonner'

interface Tab {
  id: string
  title: string
}

interface TabContextMenuProps {
  tab: Tab
  tabs: Tab[]
  position: { x: number, y: number }
  onClose: (tabId: string) => void
  onCloseOthers: (tabId: string) => void
  onCloseAll: () => void
  onCloseLeft: (tabId: string) => void
  onCloseRight: (tabId: string) => void
  onCloseMenu: () => void
}

export function TabContextMenu({
  tab,
  tabs,
  position,
  onClose,
  onCloseOthers,
  onCloseAll,
  onCloseLeft,
  onCloseRight,
  onCloseMenu,
}: TabContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCloseMenu()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseMenu()
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    document.addEventListener('keydown', handleEscape)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onCloseMenu])

  useLayoutEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current
      const rect = menu.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let left = position.x
      let top = position.y

      if (left + rect.width > viewportWidth) {
        left = viewportWidth - rect.width - 10
      }

      if (top + rect.height > viewportHeight) {
        top = viewportHeight - rect.height - 10
      }

      if (left < 10) left = 10
      if (top < 10) top = 10

      menu.style.left = `${left}px`
      menu.style.top = `${top}px`
    }
  }, [position])

  const handleCopyTitle = async () => {
    try {
      await navigator.clipboard.writeText(tab.title)
      toast.success('标题已复制到剪贴板')
      onCloseMenu()
    } catch {
      toast.error('复制失败')
      onCloseMenu()
    }
  }

  const currentIndex = tabs.findIndex(t => t.id === tab.id)
  const hasLeftTabs = currentIndex > 0
  const hasRightTabs = currentIndex < tabs.length - 1
  const hasOtherTabs = tabs.length > 1

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50 min-w-[160px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onClick={e => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClose(tab.id)
          onCloseMenu()
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
      >
        <X className="w-4 h-4" />
        关闭
      </button>

      {hasOtherTabs && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onCloseOthers(tab.id)
              onCloseMenu()
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <CircleDot className="w-4 h-4" />
            关闭其他
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onCloseAll()
              onCloseMenu()
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <Circle className="w-4 h-4" />
            关闭所有
          </button>
        </>
      )}

      {hasLeftTabs && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onCloseLeft(tab.id)
            onCloseMenu()
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          关闭左侧
        </button>
      )}

      {hasRightTabs && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onCloseRight(tab.id)
            onCloseMenu()
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
          关闭右侧
        </button>
      )}

      <div className="h-px bg-gray-200 dark:bg-zinc-700 my-1" />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          handleCopyTitle()
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
      >
        <Copy className="w-4 h-4" />
        复制标题
      </button>
    </div>
  )
}
