'use client'

import type { LucideIcon } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Book, Bot, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Dock, DockIcon } from '@/components/ui/dock'

type LayoutMode = 'horizontal' | 'vertical'

interface MenuItem {
  path: string
  label: string
  icon: LucideIcon
  exactMatch?: boolean
  specialStyle?: 'trash'
}

interface DockConfig {
  iconSize: number
  iconMagnification: number
  iconDistance: number
  animationDelay: number
}

const dockConfig: DockConfig = {
  iconSize: 80,
  iconMagnification: 96,
  iconDistance: 120,
  animationDelay: 50,
}

const menuItems: MenuItem[] = [
  { path: '/chat', label: 'Narraverse AI', icon: Bot, exactMatch: true },
  { path: '/novels', label: '我的小说', icon: Book },
  { path: '/trash', label: '回收站', icon: Trash2, specialStyle: 'trash' },
]

const styles = {
  container: {
    vertical: 'fixed right-0 top-1/2 transform -translate-y-1/2 z-40 transition-all duration-500 ease-bounce scale-75 sm:scale-90 md:scale-100',
    horizontal: 'fixed bottom-0 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-500 ease-bounce scale-75 sm:scale-90 md:scale-100',
  },
  dock: {
    vertical: 'bg-transparent! border-0! p-0! h-auto! mt-0! backdrop-blur-none! flex-col gap-3',
    horizontal: 'bg-transparent! border-0! p-0! h-auto! mt-0! backdrop-blur-none! gap-3',
  },
  active: {
    base: 'text-zinc-900 dark:text-white bg-transparent hover:bg-transparent',
    vertical: 'scale-[1.15] -translate-x-1',
    horizontal: 'scale-[1.15] -translate-y-1',
  },
  inactive: {
    base: 'text-zinc-600 dark:text-zinc-400',
    vertical: 'hover:scale-[1.2] hover:-translate-x-3 active:scale-95',
    horizontal: 'hover:scale-[1.2] hover:-translate-y-3 active:scale-95',
  },
}

function ToggleButton({
  isVisible,
  onClick,
  layoutMode,
}: {
  isVisible: boolean
  onClick: () => void
  layoutMode: LayoutMode
}) {
  const isVertical = layoutMode === 'vertical'
  const Icon = isVertical
    ? (isVisible ? ChevronRight : ChevronLeft)
    : (isVisible ? ChevronDown : ChevronUp)

  const buttonClass = isVertical
    ? 'group relative bg-white/98 dark:bg-zinc-900/98 backdrop-blur-2xl border-l border-y border-white/40 dark:border-zinc-700/40 rounded-l-[15px] px-2.5 py-6 hover:px-3.5 transition-all duration-300 shadow-[-4px_0_20px_rgba(0,0,0,0.08)] dark:shadow-[-4px_0_20px_rgba(0,0,0,0.3)] hover:shadow-[-6px_0_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[-6px_0_30px_rgba(0,0,0,0.4)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white focus-visible:ring-offset-2'
    : 'group relative bg-white/98 dark:bg-zinc-900/98 backdrop-blur-2xl border-t border-x border-white/40 dark:border-zinc-700/40 rounded-t-[15px] px-6 py-2.5 hover:py-3.5 transition-all duration-300 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_-6px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_-6px_30px_rgba(0,0,0,0.4)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white focus-visible:ring-offset-2'

  const gradientClass = isVertical
    ? 'absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/60 dark:via-white/20 to-transparent'
    : 'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent'

  const hoverGradientClass = isVertical
    ? 'absolute inset-0 rounded-l-[15px] bg-gradient-to-l from-transparent to-white/0 group-hover:to-white/30 dark:group-hover:to-white/10 transition-all duration-300 pointer-events-none'
    : 'absolute inset-0 rounded-t-[15px] bg-gradient-to-t from-transparent to-white/0 group-hover:to-white/30 dark:group-hover:to-white/10 transition-all duration-300 pointer-events-none'

  return (
    <button
      type="button"
      onClick={onClick}
      className={buttonClass}
      aria-label={isVisible ? '隐藏导航栏' : '显示导航栏'}
    >
      <div className={gradientClass} />
      <div className="relative flex items-center justify-center">
        <Icon className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
      </div>
      <div className={hoverGradientClass} />
    </button>
  )
}

function DockItem({
  item,
  index,
  active,
  layoutMode,
}: {
  item: MenuItem
  index: number
  active: boolean
  layoutMode: LayoutMode
}) {
  const Icon = item.icon
  const isVertical = layoutMode === 'vertical'
  const isTrash = item.specialStyle === 'trash'

  const activeClass = `${styles.active.base} ${isVertical ? styles.active.vertical : styles.active.horizontal}`
  const inactiveClass = `${styles.inactive.base} ${isVertical ? styles.inactive.vertical : styles.inactive.horizontal}`

  const tooltipSide = isVertical ? 'left' : 'top'
  const indicatorPosition = isVertical
    ? 'absolute -right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1'
    : 'absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1'

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <DockIcon
          className="group relative rounded-[22px]! overflow-visible"
          style={{ animationDelay: `${index * dockConfig.animationDelay}ms` }}
        >
          <Link
            href={item.path}
            className={`w-full h-full flex items-center justify-center rounded-[22px] relative transition-all duration-500 ease-bounce ${
              active ? activeClass : inactiveClass
            }`}
          >
            <Icon
              className={`relative z-10 w-10 h-10 transition-all duration-300 ${
                active
                  ? 'scale-105'
                  : isTrash
                    ? 'text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300 group-hover:scale-110 group-hover:drop-shadow-[0_2px_8px_rgba(239,68,68,0.4)]'
                    : 'group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:scale-110 group-hover:drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
              }`}
            />

            {active && (
              <div className={indicatorPosition}>
                <div className="w-1 h-1 bg-zinc-900 dark:bg-white rounded-full animate-pulse" />
              </div>
            )}

          </Link>
        </DockIcon>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side={tooltipSide}
          className="z-60 bg-zinc-900/98 dark:bg-zinc-800/98 backdrop-blur-xl text-white text-[13px] font-medium px-4 py-2.5 rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)] border border-zinc-700/50 animate-in fade-in-0 zoom-in-95 slide-in-from-right-2 duration-200"
          sideOffset={16}
        >
          {item.label}
          <Tooltip.Arrow className="fill-zinc-900/98 dark:fill-zinc-800/98" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

function DockContainer({
  isVisible,
  layoutMode,
  children,
}: {
  isVisible: boolean
  layoutMode: LayoutMode
  children: React.ReactNode
}) {
  const isVertical = layoutMode === 'vertical'
  const transitionClass = isVertical
    ? `relative transition-all duration-500 ease-bounce ${
      isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-90 pointer-events-none'
    }`
    : `relative z-40 transition-all duration-500 ease-bounce ${
      isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 scale-90 pointer-events-none'
    }`

  const shadow = isVertical
    ? 'absolute inset-y-8 -right-2 w-4 bg-black/5 dark:bg-black/20 blur-xl rounded-full -z-10'
    : 'absolute inset-x-8 -bottom-2 h-4 bg-black/5 dark:bg-black/20 blur-xl rounded-full -z-10'

  return (
    <div className={transitionClass}>
      <div className="relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/40 dark:border-zinc-700/40">
        <div className={`relative ${isVertical ? 'px-4 py-5' : 'px-5 py-4'}`}>
          <Dock
            className={styles.dock[layoutMode]}
            iconSize={dockConfig.iconSize}
            iconMagnification={dockConfig.iconMagnification}
            iconDistance={dockConfig.iconDistance}
            direction="middle"
          >
            {children}
          </Dock>
        </div>
      </div>
      <div className={shadow} />
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('horizontal')

  useEffect(() => {
    const checkPagination = () => {
      const hasPagination = document.querySelector('[data-pagination]') !== null
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setLayoutMode(hasPagination ? 'vertical' : 'horizontal')
    }

    checkPagination()
    const observer = new MutationObserver(checkPagination)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [pathname])

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const isActive = (item: MenuItem) => {
    if (item.exactMatch) {
      return pathname === item.path
    }
    return pathname === item.path || pathname.startsWith(`${item.path}/`)
  }

  const isVertical = layoutMode === 'vertical'
  const containerClass = `${styles.container[layoutMode]} ${
    isVisible ? (isVertical ? 'pr-4' : 'pb-4') : (isVertical ? 'pr-0 translate-x-[calc(100%-3rem)]' : 'pb-0 translate-y-[calc(100%-3rem)]')
  } ${isMounted ? (isVertical ? 'opacity-100 translate-x-0' : 'opacity-100 translate-y-0') : (isVertical ? 'opacity-0 translate-x-8' : 'opacity-0 translate-y-8')}`

  return (
    <Tooltip.Provider delayDuration={150}>
      <aside className={containerClass}>
        {isVertical
          ? (
              <div className="relative z-40 flex items-center">
                <div className="flex items-center mr-1.5 relative z-30">
                  <ToggleButton isVisible={isVisible} onClick={() => setIsVisible(!isVisible)} layoutMode={layoutMode} />
                </div>
                <DockContainer isVisible={isVisible} layoutMode={layoutMode}>
                  {menuItems.map((item, index) => (
                    <DockItem key={item.path} item={item} index={index} active={isActive(item)} layoutMode={layoutMode} />
                  ))}
                </DockContainer>
              </div>
            )
          : (
              <>
                <div className="flex justify-center mb-1.5 relative z-30">
                  <ToggleButton isVisible={isVisible} onClick={() => setIsVisible(!isVisible)} layoutMode={layoutMode} />
                </div>
                <DockContainer isVisible={isVisible} layoutMode={layoutMode}>
                  {menuItems.map((item, index) => (
                    <DockItem key={item.path} item={item} index={index} active={isActive(item)} layoutMode={layoutMode} />
                  ))}
                </DockContainer>
              </>
            )}
      </aside>
    </Tooltip.Provider>
  )
}
