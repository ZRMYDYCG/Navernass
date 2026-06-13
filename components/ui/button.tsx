import type { VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0',
    'rounded-[var(--radius)] text-sm font-medium text-render-crisp',
    'transition-[color,background-color,box-shadow,transform,opacity] duration-200 ease-paper',
    'cursor-pointer outline-none',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
    'motion-reduce:transition-none motion-reduce:active:transform-none',
    '[&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 [&_svg]:shrink-0',
    'focus-visible:ring-1 focus-visible:ring-ring/40',
    'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
  ].join(' '),
  {
    variants: {
      variant: {
        // 墨印主按钮：纸感阴影 + 按压反馈
        default: [
          'bg-primary text-primary-foreground shadow-paper-sm',
          'hover:bg-primary/90 hover:shadow-paper-md',
          'active:translate-y-px active:shadow-none',
        ].join(' '),
        destructive: [
          'bg-destructive text-destructive-foreground shadow-paper-sm',
          'hover:bg-destructive/90 hover:shadow-paper-md',
          'active:translate-y-px active:shadow-none',
          'focus-visible:ring-destructive/30',
        ].join(' '),
        // 纸边描线：轻卡片底 + 悬停浮起
        outline: [
          'border border-border bg-card/60 text-foreground',
          'hover:bg-accent hover:border-border hover:shadow-paper-sm',
          'active:translate-y-px active:bg-accent/80',
        ].join(' '),
        secondary: [
          'border border-border/70 bg-secondary text-secondary-foreground',
          'hover:bg-accent hover:border-border',
          'active:translate-y-px',
        ].join(' '),
        ghost: [
          'text-foreground/80',
          'hover:bg-accent/70 hover:text-foreground',
          'active:bg-accent',
        ].join(' '),
        link: 'text-primary underline-offset-4 hover:underline',
        // 文字链接式，适合侧边栏操作、工具栏次级按钮
        subtle: 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
        // 带底部线条的标签按钮，适合页面内 Tab
        tab: [
          'rounded-none border-b-2 border-transparent px-0 pb-2',
          'font-medium text-muted-foreground shadow-none',
          'hover:text-foreground',
          'data-[active=true]:border-primary data-[active=true]:text-foreground',
        ].join(' '),
      },
      size: {
        'default': 'h-9 px-4 py-2 has-[>svg]:px-3',
        'sm': 'h-8 gap-1.5 px-3 text-[13px] has-[>svg]:px-2.5',
        'lg': 'h-10 px-6 text-base font-serif has-[>svg]:px-4',
        'icon': 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
        // 紧凑型，适合工具栏 / 内联操作
        'xs': 'h-6 px-2 text-xs gap-1 has-[>svg]:px-1.5 [&_svg:not([class*=\'size-\'])]:size-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'>
  & VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
