import * as React from 'react'
import { cn } from '@/lib/utils'

interface PaperCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'stack' | 'floating'
  isMenuActive?: boolean
}

function PaperCard({ ref, className, variant = 'default', isMenuActive, ...props }: PaperCardProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={ref}
      className={cn(
        'relative bg-card rounded-xl border border-border',
        'shadow-sm transition-all duration-300',
        'overflow-hidden',
        {
          'hover:shadow-md hover:-translate-y-1': variant === 'default' && !isMenuActive,
          'shadow-md -translate-y-1': variant === 'default' && isMenuActive,
          'shadow-md rotate-1 after:absolute after:inset-0 after:bg-card after:rounded-xl after:border after:border-border after:-z-10 after:-rotate-2 after:shadow-sm': variant === 'stack',
          'hover:shadow-xl hover:-translate-y-1': variant === 'floating' && !isMenuActive,
          'shadow-xl -translate-y-1': variant === 'floating' && isMenuActive,
        },
        className,
      )}
      {...props}
    >
      <div className="relative z-10 h-full">{props.children}</div>
    </div>
  )
}
PaperCard.displayName = 'PaperCard'

export { PaperCard }
