import * as React from 'react'
import { cn } from '@/lib/utils'

interface PaperCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'stack' | 'floating' | 'book'
  isMenuActive?: boolean
  /** book 变体左侧色带颜色，默认使用 primary */
  accentColor?: string
}

function PaperCard({ ref, className, variant = 'default', isMenuActive, accentColor, ...props }: PaperCardProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  // book 变体：立体书脊效果
  if (variant === 'book') {
    return (
      <div
        ref={ref}
        className={cn(
          'relative transition-all duration-300',
          {
            'hover:-translate-y-0.5': !isMenuActive,
            '-translate-y-0.5': isMenuActive,
          },
          className,
        )}
        {...props}
      >
        {/* 书脊页叠 —— 由近到远三层 */}
        <span
          className="absolute left-0 top-[6px] bottom-[6px] w-[6px] -translate-x-[5px] rounded-l-[3px] bg-gray-300 dark:bg-gray-600 z-[1]"
          aria-hidden
        />
        <span
          className="absolute left-0 top-[10px] bottom-[10px] w-[5px] -translate-x-[9px] rounded-l-[2px] bg-gray-200 dark:bg-gray-700 z-[0]"
          aria-hidden
        />
        <span
          className="absolute left-0 top-[14px] bottom-[14px] w-[4px] -translate-x-[12px] rounded-l-[2px] bg-gray-200/50 dark:bg-gray-700/50 z-[-1]"
          aria-hidden
        />

        {/* 主卡片体 */}
        <div
          className={cn(
            'relative z-[2] bg-card rounded-lg border border-border overflow-hidden w-full h-full',
            {
              'shadow-paper-sm hover:shadow-paper-md': !isMenuActive,
              'shadow-paper-md': isMenuActive,
            },
          )}
        >
          <div className="relative z-10 h-full">{props.children}</div>
        </div>

        {/* 左侧渐变：模拟书脊弧度阴影 */}
        <div
          className="absolute inset-y-0 left-0 w-5 z-[3] pointer-events-none rounded-l-lg"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.08), transparent)' }}
          aria-hidden
        />
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        'relative bg-card rounded-lg border border-border',
        'transition-all duration-300',
        'overflow-hidden',
        {
          'hover:shadow-paper-md hover:-translate-y-0.5 shadow-paper-sm': variant === 'default' && !isMenuActive,
          'shadow-paper-md -translate-y-0.5': variant === 'default' && isMenuActive,
          'shadow-paper-md rotate-1 after:absolute after:inset-0 after:bg-card after:rounded-lg after:border after:border-border after:-z-10 after:-rotate-2 after:shadow-paper-sm': variant === 'stack',
          'hover:shadow-paper-lg hover:-translate-y-0.5 shadow-paper-sm': variant === 'floating' && !isMenuActive,
          'shadow-paper-lg -translate-y-0.5': variant === 'floating' && isMenuActive,
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
