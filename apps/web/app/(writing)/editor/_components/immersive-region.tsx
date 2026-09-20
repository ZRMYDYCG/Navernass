import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ImmersiveRegionProps {
  isImmersive: boolean
  children: ReactNode
  className?: string
  overlayClassName?: string
}

export function ImmersiveRegion({
  isImmersive,
  children,
  className,
  overlayClassName,
}: ImmersiveRegionProps) {
  return (
    <div className={cn('relative', isImmersive && 'group/immersive', className)}>
      {children}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 z-20 bg-background/40 transition-[opacity,backdrop-filter] duration-200',
          isImmersive
            ? 'opacity-100 backdrop-blur-sm group-hover/immersive:opacity-0 group-hover/immersive:backdrop-blur-0'
            : 'opacity-0 backdrop-blur-0',
          overlayClassName,
        )}
      />
    </div>
  )
}
