'use client'

import { ChevronLeft, ChevronRight, Circle, CircleDot, Copy, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useI18n } from '@/hooks/use-i18n'

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
  const { t } = useI18n()

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
      toast.success(t('editor.tabs.menu.copyTitleSuccess'))
      onCloseMenu()
    } catch {
      toast.error(t('editor.tabs.menu.copyFailed'))
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
      className="fixed bg-card rounded-lg shadow-lg border border-border p-1 z-50 min-w-[160px]"
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
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
      >
        <X className="w-4 h-4" />
        {t('editor.tabs.menu.close')}
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
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <CircleDot className="w-4 h-4" />
            {t('editor.tabs.menu.closeOthers')}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onCloseAll()
              onCloseMenu()
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <Circle className="w-4 h-4" />
            {t('editor.tabs.menu.closeAll')}
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
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('editor.tabs.menu.closeLeft')}
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
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
          {t('editor.tabs.menu.closeRight')}
        </button>
      )}

      <div className="h-px bg-border my-1" />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          handleCopyTitle()
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
      >
        <Copy className="w-4 h-4" />
        {t('editor.tabs.menu.copyTitle')}
      </button>
    </div>
  )
}
