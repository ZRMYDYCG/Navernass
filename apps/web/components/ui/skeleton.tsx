import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const skeletonVariants = cva(
  [
    'relative overflow-hidden',
    'rounded-[var(--radius)]',
    'motion-reduce:animate-none',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-muted/45',
          'bg-gradient-to-r from-muted/35 via-muted/65 to-muted/35 bg-[length:200%_100%]',
          'animate-skeleton-shimmer',
        ].join(' '),
        line: [
          'h-4 rounded-sm',
          'bg-muted/45',
          'bg-gradient-to-r from-muted/35 via-muted/65 to-muted/35 bg-[length:200%_100%]',
          'animate-skeleton-shimmer',
        ].join(' '),
        circle: 'rounded-full bg-muted/50 animate-skeleton-breathe',
        card: [
          'border border-border/40 bg-card/60',
          'bg-gradient-to-r from-card/50 via-muted/40 to-card/50 bg-[length:200%_100%]',
          'animate-skeleton-shimmer',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const TEXT_LINE_WIDTHS = ['w-full', 'w-full', 'w-[95%]', 'w-[88%]', 'w-[92%]', 'w-[76%]'] as const

function Skeleton({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof skeletonVariants>) {
  return (
    <div
      data-slot="skeleton"
      data-variant={variant ?? 'default'}
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  )
}

interface SkeletonTextProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  lines?: number
  /** 行间距，默认 gap-2 */
  gap?: string
}

/** 文稿行占位：模拟段落宽度起伏 */
function SkeletonText({ lines = 3, gap = 'gap-2', className, ...props }: SkeletonTextProps) {
  return (
    <div className={cn('flex flex-col', gap, className)} {...props}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant="line"
          className={TEXT_LINE_WIDTHS[i % TEXT_LINE_WIDTHS.length]}
        />
      ))}
    </div>
  )
}

interface SkeletonAvatarProps extends React.ComponentProps<'div'> {
  size?: 'sm' | 'default' | 'lg'
}

const avatarSizes = {
  sm: 'size-8',
  default: 'size-10',
  lg: 'size-12',
} as const

function SkeletonAvatar({ size = 'default', className, ...props }: SkeletonAvatarProps) {
  return (
    <Skeleton
      variant="circle"
      className={cn(avatarSizes[size], 'shrink-0', className)}
      {...props}
    />
  )
}

export { Skeleton, SkeletonAvatar, SkeletonText, skeletonVariants }
