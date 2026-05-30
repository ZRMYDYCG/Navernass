'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type HoverActionGroup = 'chapter' | 'volume'

const GROUP_HOVER_REVEAL: Record<HoverActionGroup, string> = {
  chapter: 'group-hover/chapter:translate-x-0 group-hover/chapter:opacity-100',
  volume: 'group-hover/volume:translate-x-0 group-hover/volume:opacity-100',
}

interface HoverActionButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  delayMs: number
  group: HoverActionGroup
  variant?: 'default' | 'destructive'
  children: ReactNode
}

export function HoverActionButton({
  label,
  onClick,
  disabled,
  delayMs,
  group,
  variant = 'default',
  children,
}: HoverActionButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded transition-all duration-200 ease-out',
        'translate-x-4 opacity-0',
        GROUP_HOVER_REVEAL[group],
        'disabled:pointer-events-none disabled:opacity-40',
        variant === 'destructive'
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

const GROUP_HOVER_BAR: Record<HoverActionGroup, { reveal: string, gradientDefault: string, gradientExpanded: string }> = {
  chapter: {
    reveal: 'group-hover/chapter:pointer-events-auto group-hover/chapter:opacity-100',
    gradientDefault: 'bg-gradient-to-l from-background/95 via-background/80 to-transparent',
    gradientExpanded: 'bg-gradient-to-l from-background via-background/95 to-transparent',
  },
  volume: {
    reveal: 'group-hover/volume:pointer-events-auto group-hover/volume:opacity-100',
    gradientDefault: 'bg-gradient-to-l from-accent via-accent/95 to-transparent',
    gradientExpanded: 'bg-gradient-to-l from-accent via-accent/95 to-transparent',
  },
}

interface HoverActionBarProps {
  group: HoverActionGroup
  expanded?: boolean
  children: ReactNode
}

export function HoverActionBar({ group, expanded = false, children }: HoverActionBarProps) {
  const styles = GROUP_HOVER_BAR[group]

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-y-0 right-0 flex items-center gap-0.5 pl-6 pr-1',
        'opacity-0 transition-opacity duration-200 ease-out',
        styles.reveal,
        expanded ? styles.gradientExpanded : styles.gradientDefault,
      )}
    >
      {children}
    </div>
  )
}
