import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const loadingVariants = cva('flex items-center justify-center', {
  variants: {
    variant: {
      spinner: '',
      dots: '',
      pulse: '',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    variant: 'spinner',
    size: 'md',
  },
})

interface LoadingProps extends VariantProps<typeof loadingVariants> {
  text?: string
  className?: string
  fullScreen?: boolean
}

// Spinner 动画组件
function SpinnerLoading({ size, text }: { size: 'sm' | 'md' | 'lg' | null, text?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Loader2
        className={cn(
          'animate-spin text-gray-600 dark:text-gray-400',
          sizeClasses[size || 'md'],
        )}
      />
      {text && (
        <p
          className={cn(
            'text-gray-600 dark:text-gray-400 font-medium',
            textSizeClasses[size || 'md'],
          )}
        >
          {text}
        </p>
      )}
    </div>
  )
}

// Dots 动画组件
function DotsLoading({ size, text }: { size: 'sm' | 'md' | 'lg' | null, text?: string }) {
  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-4 h-4',
  }

  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn('flex items-center', gapClasses[size || 'md'])}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={cn(
              'rounded-full bg-gray-600 dark:bg-gray-400 animate-pulse',
              dotSizeClasses[size || 'md'],
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1s',
            }}
          />
        ))}
      </div>
      {text && (
        <p
          className={cn(
            'text-gray-600 dark:text-gray-400 font-medium',
            textSizeClasses[size || 'md'],
          )}
        >
          {text}
        </p>
      )}
    </div>
  )
}

// Pulse 动画组件
function PulseLoading({ size, text }: { size: 'sm' | 'md' | 'lg' | null, text?: string }) {
  const pulseSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div
          className={cn(
            'rounded-full bg-gray-600 dark:bg-gray-400 opacity-75 animate-ping absolute',
            pulseSizeClasses[size || 'md'],
          )}
        />
        <div
          className={cn(
            'rounded-full bg-gray-600 dark:bg-gray-400 relative',
            pulseSizeClasses[size || 'md'],
          )}
        />
      </div>
      {text && (
        <p
          className={cn(
            'text-gray-600 dark:text-gray-400 font-medium',
            textSizeClasses[size || 'md'],
          )}
        >
          {text}
        </p>
      )}
    </div>
  )
}

export function Loading({
  variant = 'spinner',
  size = 'md',
  text,
  className,
  fullScreen = false,
}: LoadingProps) {
  const content = (
    <div className={cn(loadingVariants({ variant, size }), className)}>
      {variant === 'spinner' && <SpinnerLoading size={size} text={text} />}
      {variant === 'dots' && <DotsLoading size={size} text={text} />}
      {variant === 'pulse' && <PulseLoading size={size} text={text} />}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
        {content}
      </div>
    )
  }

  return content
}

// 页面级 Loading（整页加载）
export function PageLoading({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-white dark:bg-gray-900">
      <Loading variant="spinner" size="md" text={text} />
    </div>
  )
}

// 内联 Loading（局部加载）
export function InlineLoading({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-4">
      <Loading variant="spinner" size="sm" text={text} />
    </div>
  )
}

// 全屏 Loading（重要操作）
export function FullScreenLoading({ text = '处理中...' }: { text?: string }) {
  return <Loading variant="spinner" size="lg" text={text} fullScreen />
}
