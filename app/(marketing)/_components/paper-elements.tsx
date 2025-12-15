'use client'

import { motion } from 'framer-motion'
import React from 'react'
import { cn } from '@/lib/utils'

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
  stackCount = 0,
  rotation = 0,
  tape = false,
}: PaperSheetProps) {
  return (
    <div className="relative group perspective-1000" style={{ transform: `rotate(${rotation}deg)` }}>
      {/* Stack Layers (The papers underneath) */}
      {stackCount > 0 && Array.from({ length: stackCount }).map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-[#FDFCF8] border border-stone-200/60 rounded-sm shadow-sm transition-transform duration-500 group-hover:translate-y-1"
          style={{
            zIndex: -1 - i,
            transform: `rotate(${-(i + 1) * 1.5}deg) translate(${i * 2}px, ${i * 2}px)`,
          }}
        />
      ))}

      {/* Main Sheet */}
      <div className={`relative bg-[#FDFCF8] border border-stone-200 rounded-sm shadow-xl transition-all duration-500 ${className}`}>
        {/* Tape Effect */}
        {tape && (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 z-20 opacity-80"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              transform: 'rotate(1deg)',
              backdropFilter: 'blur(1px)',
              borderLeft: '1px solid rgba(255,255,255,0.6)',
              borderRight: '1px solid rgba(255,255,255,0.6)',
            }}
          />
        )}
        {children}
      </div>
    </div>
  )
}
export function Highlighter({ children, color = 'yellow', className }: { children: React.ReactNode, color?: 'yellow' | 'green' | 'blue' | 'pink', className?: string }) {
  const colors = {
    yellow: 'bg-yellow-200/40 dark:bg-yellow-500/20',
    green: 'bg-green-200/40 dark:bg-green-500/20',
    blue: 'bg-blue-200/40 dark:bg-blue-500/20',
    pink: 'bg-pink-200/40 dark:bg-pink-500/20',
  }

  return (
    <span className={cn('relative inline-block px-1 mx-[-0.25rem]', className)}>
      <span className={cn('absolute inset-0 skew-y-[-1deg] rounded-sm -z-10', colors[color])} />
      {children}
    </span>
  )
}

export function CutLine() {
  return (
    <div className="relative w-full h-px my-8">
      <div className="absolute inset-0 border-t-2 border-dashed border-muted-foreground/30" />
      <div className="absolute right-0 -top-3 text-muted-foreground/30">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
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

export function StickyNote({ children, className, color = 'yellow', rotation = 0 }: { children: React.ReactNode, className?: string, color?: 'yellow' | 'blue' | 'pink', rotation?: number }) {
  const colors = {
    yellow: 'bg-[#fdfbf0] dark:bg-yellow-900/10 border-yellow-200/50 dark:border-yellow-800/30',
    blue: 'bg-[#f0f7fd] dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/30',
    pink: 'bg-[#fdf0f4] dark:bg-pink-900/10 border-pink-200/50 dark:border-pink-800/30',
  }

  const [hoverRotationOffset] = React.useState(() => Math.random() * 4 - 2)

  return (
    <motion.div
      className={cn('p-4 shadow-paper-sm text-sm font-handwriting border', colors[color], className)}
      style={{ rotate: rotation }}
      whileHover={{ scale: 1.1, rotate: rotation + hoverRotationOffset }}
    >
      {children}
    </motion.div>
  )
}
