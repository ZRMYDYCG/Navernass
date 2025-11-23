'use client'

import { X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TabContextMenu } from './tab-context-menu'

interface Tab {
  id: string
  title: string
}

interface SmartTabsProps {
  tabs: Tab[]
  activeTab: string | null
  onTabChange: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onTabCloseOthers?: (tabId: string) => void
  onTabCloseAll?: () => void
  onTabCloseLeft?: (tabId: string) => void
  onTabCloseRight?: (tabId: string) => void
}

export function SmartTabs({
  tabs,
  activeTab,
  onTabChange,
  onTabClose,
  onTabCloseOthers,
  onTabCloseAll,
  onTabCloseLeft,
  onTabCloseRight,
}: SmartTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLDivElement>(null)
  const [showScrollbar, setShowScrollbar] = useState(false)
  const [scrollbarWidth, setScrollbarWidth] = useState(0)
  const [scrollbarLeft, setScrollbarLeft] = useState(0)
  const [contextMenu, setContextMenu] = useState<{
    tab: Tab
    position: { x: number, y: number }
  } | null>(null)

  // 自动滚动到激活的 Tab
  const scrollToActiveTab = useCallback(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const activeElement = activeTabRef.current

      const containerRect = container.getBoundingClientRect()
      const activeRect = activeElement.getBoundingClientRect()

      // 如果激活的 Tab 在视图外，滚动到它
      if (activeRect.left < containerRect.left) {
        container.scrollLeft -= containerRect.left - activeRect.left + 20
      } else if (activeRect.right > containerRect.right) {
        container.scrollLeft += activeRect.right - containerRect.right + 20
      }
    }
  }, [])

  // 当激活的 Tab 改变时滚动
  useEffect(() => {
    scrollToActiveTab()
  }, [activeTab, scrollToActiveTab])

  // 当容器宽度改变时，激活的 Tab 仍然可见，智能滚动到激活的 Tab
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      scrollToActiveTab()
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [scrollToActiveTab])

  // 鼠标滚轮水平滚动
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      // 如果已经在水平滚动，或者有内容可以水平滚动
      if (e.deltaX !== 0 || container.scrollWidth > container.clientWidth) {
        e.preventDefault()
        container.scrollLeft += e.deltaY
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [])

  // 更新自定义滚动条
  const updateScrollbar = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container

    // 如果没有横向滚动内容，隐藏滚动条
    if (scrollWidth <= clientWidth) {
      setScrollbarWidth(0)
      return
    }

    // 计算滚动条宽度（按比例）
    const scrollbarWidthPercent = (clientWidth / scrollWidth) * 100
    setScrollbarWidth(scrollbarWidthPercent)

    // 计算滚动条位置
    const scrollPercent = scrollLeft / (scrollWidth - clientWidth)
    const maxScrollbarLeft = 100 - scrollbarWidthPercent
    setScrollbarLeft(scrollPercent * maxScrollbarLeft)
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    updateScrollbar()
    container.addEventListener('scroll', updateScrollbar)
    window.addEventListener('resize', updateScrollbar)

    return () => {
      container.removeEventListener('scroll', updateScrollbar)
      window.removeEventListener('resize', updateScrollbar)
    }
  }, [tabs, updateScrollbar])

  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent, tab: Tab) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      tab,
      position: { x: e.clientX, y: e.clientY },
    })
  }

  // 关闭右键菜单
  const handleCloseContextMenu = () => {
    setContextMenu(null)
  }

  // 点击外部关闭菜单
  useEffect(() => {
    if (!contextMenu) return

    const handleClickOutside = () => {
      setContextMenu(null)
    }

    // 延迟执行，避免立即触发
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu])

  return (
    <div
      className="relative bg-transparent"
      onMouseEnter={() => setShowScrollbar(true)}
      onMouseLeave={() => setShowScrollbar(false)}
    >
      {/* 滚动容器 */}
      <div
        ref={scrollContainerRef}
        className="smart-tabs-container flex items-center overflow-x-auto overflow-y-hidden scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style jsx>
          {`
          .smart-tabs-container::-webkit-scrollbar {
            display: none;
          }
          .smart-tabs-container .group {
            --close-btn-padding: 1rem;
          }
          .smart-tabs-container .group:hover {
            --close-btn-padding: 2rem;
          }
        `}
        </style>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <div
              key={tab.id}
              ref={isActive ? activeTabRef : null}
              onClick={() => onTabChange(tab.id)}
              onContextMenu={e => handleContextMenu(e, tab)}
              className={`group relative flex items-center px-4 py-2.5 cursor-pointer transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-white/60 dark:bg-zinc-800/60 text-gray-900 dark:text-gray-100 border-b-2 border-gray-900 dark:border-gray-100'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              style={{
                paddingRight: 'var(--close-btn-padding, 1rem)',
              }}
            >
              <span className="text-sm truncate max-w-[150px] transition-all duration-200 group-hover:max-w-[130px]">
                {tab.title}
              </span>

              {/* 关闭按钮 - 绝对定位，不占据空间，悬停时显示并撑开 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose(tab.id)
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded transition-all duration-200 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 hover:bg-gray-200 dark:hover:bg-gray-700 pointer-events-none group-hover:pointer-events-auto cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>

      {/* 渐变遮罩 - 左侧 */}
      {/* <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none" /> */}

      {/* 渐变遮罩 - 右侧 */}
      {/* <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none" /> */}

      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 transition-opacity duration-200 pointer-events-none ${
          showScrollbar && scrollbarWidth < 100 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="h-full bg-gray-300 dark:bg-zinc-600 rounded-full transition-all duration-200"
          style={{
            width: `${scrollbarWidth}%`,
            marginLeft: `${scrollbarLeft}%`,
          }}
        />
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <TabContextMenu
          tab={contextMenu.tab}
          tabs={tabs}
          position={contextMenu.position}
          onClose={onTabClose}
          onCloseOthers={onTabCloseOthers || onTabClose}
          onCloseAll={onTabCloseAll || (() => {})}
          onCloseLeft={onTabCloseLeft || onTabClose}
          onCloseRight={onTabCloseRight || onTabClose}
          onCloseMenu={handleCloseContextMenu}
        />
      )}
    </div>
  )
}
