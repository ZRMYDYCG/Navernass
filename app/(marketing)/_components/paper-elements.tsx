'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

// ============================================================================
// 纸张容器组件
// ============================================================================
interface PaperSheetProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'plain' | 'lined' | 'grid' | 'dotted'
  stackCount?: number
  rotation?: number
  pin?: boolean
  tape?: boolean
  clip?: boolean
  holePunch?: boolean
  tornEdge?: boolean
}

export function PaperSheet({
  className,
  children,
  variant = 'plain',
  stackCount = 0,
  rotation = 0,
  pin = false,
  tape = false,
  clip = false,
  holePunch = false,
  tornEdge = false,
  ...props
}: PaperSheetProps) {
  return (
    <div className="relative group">
      {/* 纸张堆叠效果 */}
      {stackCount > 0 &&
        Array.from({ length: stackCount }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 bg-background border border-border shadow-sm rounded-sm -z-10"
            style={{
              transform: `rotate(${(i + 1) * 1.5}deg) translate(${(i + 1) * 2}px, ${(i + 1) * 2}px)`,
              opacity: 0.5 - i * 0.1,
            }}
          />
        ))}

      {/* 主纸张 */}
      <motion.div
        className={cn(
          'relative bg-background border border-border shadow-paper-md rounded-sm overflow-hidden transition-transform duration-300',
          tornEdge && 'paper-edge-tear pb-4',
          className
        )}
        style={{ rotate: rotation }}
        whileHover={{ rotate: 0, scale: 1.02 }}
        {...props as any}
      >
        {/* 纸张纹理背景 */}
        <div className="absolute inset-0 bg-paper-texture opacity-50 pointer-events-none" />

        {/* 网格/线条样式 */}
        {variant === 'grid' && (
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]" />
        )}
        {variant === 'lined' && (
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:100%_24px]" />
        )}
        {variant === 'dotted' && (
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#808080_1px,transparent_1px)] bg-[size:20px_20px]" />
        )}

        {/* 装饰元素：装订孔 */}
        {holePunch && (
          <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-around py-4 z-20 pointer-events-none">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-4 h-4 rounded-full bg-background border border-border shadow-inner" />
            ))}
          </div>
        )}

        {/* 内容区域 */}
        <div className={cn("relative z-10", holePunch && "pl-12")}>
            {children}
        </div>
      </motion.div>

      {/* 装饰元素：胶带 */}
      {tape && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-yellow-100/80 dark:bg-yellow-900/30 backdrop-blur-[1px] shadow-sm rotate-[-2deg] z-30 pointer-events-none border-l border-r border-white/20" />
      )}

      {/* 装饰元素：大头针 */}
      {pin && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="w-4 h-4 rounded-full bg-red-500 shadow-md border-2 border-red-600 relative z-10" />
          <div className="w-1 h-3 bg-gray-400 absolute top-full left-1/2 -translate-x-1/2 -mt-1 -z-10 opacity-50" />
        </div>
      )}

      {/* 装饰元素：回形针 */}
      {clip && (
        <div className="absolute -top-2 right-8 z-30 pointer-events-none">
            <svg width="20" height="40" viewBox="0 0 20 40" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M10 0V30C10 35.5228 5.52285 40 0 40" />
                <path d="M14 4V34C14 37.3137 11.3137 40 8 40C4.68629 40 2 37.3137 2 34V10" />
            </svg>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// 荧光笔标记组件
// ============================================================================
export function Highlighter({ children, color = 'yellow', className }: { children: React.ReactNode, color?: 'yellow' | 'green' | 'blue' | 'pink', className?: string }) {
    const colors = {
        yellow: 'bg-yellow-200/40 dark:bg-yellow-500/20',
        green: 'bg-green-200/40 dark:bg-green-500/20',
        blue: 'bg-blue-200/40 dark:bg-blue-500/20',
        pink: 'bg-pink-200/40 dark:bg-pink-500/20',
    }
    
    return (
        <span className={cn("relative inline-block px-1 mx-[-0.25rem]", className)}>
            <span className={cn("absolute inset-0 skew-y-[-1deg] rounded-sm -z-10", colors[color])} />
            {children}
        </span>
    )
}

// ============================================================================
// 分割线组件（虚线裁切线）
// ============================================================================
export function CutLine() {
    return (
        <div className="relative w-full h-px my-8">
            <div className="absolute inset-0 border-t-2 border-dashed border-muted-foreground/30" />
            <div className="absolute right-0 -top-3 text-muted-foreground/30">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="6" r="3" />
                    <path d="M8.12 8.12 12 12" />
                    <path d="M20 4 8.12 15.88" />
                    <circle cx="6" cy="18" r="3" />
                    <path d="M14.8 14.8 20 20" />
                </svg>
            </div>
        </div>
    )
}

// ============================================================================
// 便签组件
// ============================================================================
export function StickyNote({ children, className, color = 'yellow', rotation = 0 }: { children: React.ReactNode, className?: string, color?: 'yellow' | 'blue' | 'pink', rotation?: number }) {
    const colors = {
        yellow: 'bg-[#fdfbf0] dark:bg-yellow-900/10 border-yellow-200/50 dark:border-yellow-800/30',
        blue: 'bg-[#f0f7fd] dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/30',
        pink: 'bg-[#fdf0f4] dark:bg-pink-900/10 border-pink-200/50 dark:border-pink-800/30',
    }

    return (
        <motion.div 
            className={cn(
                "p-4 shadow-paper-sm text-sm font-handwriting border",
                colors[color],
                className
            )}
            style={{ rotate: rotation }}
            whileHover={{ scale: 1.1, rotate: rotation + (Math.random() * 4 - 2) }}
        >
            {children}
        </motion.div>
    )
}

