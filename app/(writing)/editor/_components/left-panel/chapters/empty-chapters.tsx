'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const ACTIONS_SELECTOR = '[data-chapter-header-actions]'

interface ArrowData {
  path: string
  head: string
}

interface EmptyChaptersProps {
  onCreateChapter?: () => void
  onCreateVolume?: () => void
}

export function EmptyChapters(_props: EmptyChaptersProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const logoRef = useRef<HTMLDivElement | null>(null)
  const [arrowData, setArrowData] = useState<ArrowData | null>(null)

  useEffect(() => {
    const createArrowHead = (
      endX: number,
      endY: number,
      controlX: number,
      controlY: number,
    ) => {
      const angle = Math.atan2(endY - controlY, endX - controlX)
      const size = 11
      const spread = Math.PI / 5.6

      const leftX = endX - (Math.cos(angle - spread) * size)
      const leftY = endY - (Math.sin(angle - spread) * size)
      const rightX = endX - (Math.cos(angle + spread) * size)
      const rightY = endY - (Math.sin(angle + spread) * size)

      return `M ${leftX} ${leftY} L ${endX} ${endY} L ${rightX} ${rightY}`
    }

    const updateArrowPath = () => {
      const root = rootRef.current
      const logo = logoRef.current
      const actions = document.querySelector(ACTIONS_SELECTOR)

      if (!root || !logo || !actions) {
        setArrowData(null)
        return
      }

      const rootRect = root.getBoundingClientRect()
      const logoRect = logo.getBoundingClientRect()
      const actionsRect = actions.getBoundingClientRect()

      const startX = logoRect.left - rootRect.left + (logoRect.width / 2) + 10
      const startY = logoRect.top - rootRect.top + (logoRect.height / 2) - 10
      const endX = actionsRect.left - rootRect.left + (actionsRect.width / 2) - 18
      const endY = actionsRect.bottom - rootRect.top + 68
      const deltaX = endX - startX
      const deltaY = startY - endY

      const control1X = startX + (deltaX * 0.12)
      const control1Y = startY + 34
      const control2X = startX + (deltaX * 0.32)
      const control2Y = startY - (deltaY * 0.08)
      const midX = startX + (deltaX * 0.46)
      const midY = startY - (deltaY * 0.34)
      const control3X = startX + (deltaX * 0.6)
      const control3Y = startY - (deltaY * 0.52)
      const control4X = endX - (deltaX * 0.16)
      const control4Y = endY + 52

      const path = [
        `M ${startX} ${startY}`,
        `C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${midX} ${midY}`,
        `C ${control3X} ${control3Y}, ${control4X} ${control4Y}, ${endX} ${endY}`,
      ].join(' ')

      const head = createArrowHead(endX, endY, control4X, control4Y)

      setArrowData({ path, head })
    }

    const frameId = window.requestAnimationFrame(updateArrowPath)
    const resizeObserver = new ResizeObserver(updateArrowPath)

    if (rootRef.current) resizeObserver.observe(rootRef.current)
    if (logoRef.current) resizeObserver.observe(logoRef.current)

    const actions = document.querySelector(ACTIONS_SELECTOR)
    if (actions) resizeObserver.observe(actions)

    window.addEventListener('resize', updateArrowPath)

    return () => {
      window.cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateArrowPath)
    }
  }, [])

  return (
    <div ref={rootRef} className="relative flex h-full items-center justify-center overflow-visible p-6">
      <div className="pointer-events-none absolute inset-0 hidden overflow-hidden dark:block">
        <div className="absolute top-[18%] left-[12%] h-[0.5px] w-[58%] rotate-[-14deg] bg-gradient-to-r from-transparent via-violet-500/45 to-transparent animate-pulse [animation-duration:3s]" />
        <div className="absolute top-[38%] right-[4%] h-[0.5px] w-[52%] rotate-[9deg] bg-gradient-to-r from-transparent via-sky-400/45 to-transparent animate-pulse [animation-duration:4.2s] [animation-delay:0.4s]" />
        <div className="absolute top-[64%] left-[16%] h-[0.5px] w-[46%] rotate-[-7deg] bg-gradient-to-r from-transparent via-pink-400/35 to-transparent animate-pulse [animation-duration:3.6s] [animation-delay:0.9s]" />
        <div className="absolute top-[82%] right-[10%] h-[0.5px] w-[42%] rotate-[5deg] bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent animate-pulse [animation-duration:4.6s] [animation-delay:1.4s]" />
      </div>

      {arrowData && (
        <svg className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible text-muted-foreground/50 md:block" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="empty-chapters-arrow-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.2" />
            </filter>
            <linearGradient id="empty-chapters-arrow-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
              <stop offset="45%" stopColor="currentColor" stopOpacity="0.38" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.72" />
            </linearGradient>
          </defs>
          <path
            d={arrowData.path}
            stroke="url(#empty-chapters-arrow-gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#empty-chapters-arrow-glow)"
          />
          <path
            d={arrowData.path}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="4 5"
          />
          <path
            d={arrowData.head}
            stroke="url(#empty-chapters-arrow-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#empty-chapters-arrow-glow)"
          />
          <path
            d={arrowData.head}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      <div className="relative z-10 max-w-sm text-center">

        <div ref={logoRef} className="mx-auto mb-3 flex items-center justify-center text-muted-foreground">
          <Image
            src="/assets/svg/logo-dark.svg"
            width={52}
            height={52}
            alt="Narraverse"
            className="dark:hidden"
          />
          <Image
            src="/assets/svg/logo-light.svg"
            width={52}
            height={52}
            alt="Narraverse"
            className="hidden dark:block"
          />
        </div>

        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          开始你的创作之旅，创建你的第一个章节或卷
        </p>
      </div>
    </div>
  )
}
