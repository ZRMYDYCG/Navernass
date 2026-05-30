'use client'

import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AguiExpandableContentProps {
  open: boolean
  children: ReactNode
  className?: string
  innerClassName?: string
}

/**
 * 高度展开/收起动画（grid 0fr ↔ 1fr），内容保持在 DOM 中以支持过渡。
 */
export function AguiExpandableContent({
  open,
  children,
  className,
  innerClassName,
}: AguiExpandableContentProps) {
  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows] duration-200 ease-out',
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        className,
      )}
    >
      <div className="overflow-hidden min-h-0">
        <div className={innerClassName}>{children}</div>
      </div>
    </div>
  )
}

interface AguiExpandChevronProps {
  open: boolean
  className?: string
}

/** 与 AguiExpandableContent 配套的 chevron 旋转 */
export function AguiExpandChevron({ open, className }: AguiExpandChevronProps) {
  return (
    <ChevronDown
      className={cn(
        'w-3 h-3 shrink-0 transition-transform duration-200 ease-out',
        open && 'rotate-180',
        className,
      )}
    />
  )
}
