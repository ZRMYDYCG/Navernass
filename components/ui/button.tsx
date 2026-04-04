import type { VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/85 shadow-none',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border border-border bg-transparent shadow-none hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-none',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
        // 文字链接式，适合侧边栏操作、工具栏次级按钮
        subtle: 'text-muted-foreground hover:text-foreground hover:bg-accent/50 shadow-none',
        // 带底部线条的标签按钮，适合页面内Tab
        tab: 'rounded-none border-b-2 border-transparent data-[active=true]:border-primary data-[active=true]:text-foreground px-0 pb-2 font-medium shadow-none text-muted-foreground hover:text-foreground',
      },
      size: {
        'default': 'h-9 px-4 py-2 has-[>svg]:px-3',
        'sm': 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        'lg': 'h-10 rounded-md px-6 has-[>svg]:px-4',
        'icon': 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
        // 紧凑型，适合工具栏 / 内联操作
        'xs': 'h-6 rounded px-2 text-xs gap-1 has-[>svg]:px-1.5 [&_svg:not([class*=\'size-\'])]:size-3',
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
