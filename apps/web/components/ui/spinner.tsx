import type { VariantProps } from 'class-variance-authority'
import { PenLine } from 'lucide-react'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const spinnerVariants = cva('shrink-0', {
  variants: {
    variant: {
      ring: 'inline-flex size-8 text-primary',
      dots: 'inline-flex size-5 text-primary',
      pen: 'relative inline-flex items-center gap-2 text-primary',
    },
  },
  defaultVariants: {
    variant: 'ring',
  },
})

type SpinnerProps = VariantProps<typeof spinnerVariants> & {
  className?: string
  /** 读屏文案，默认 Loading */
  label?: string
}

const SATELLITE_PLANES = ['a', 'b', 'c'] as const
const DOT_ORBIT_ANGLES = [0, 120, 240] as const

/** 三轨墨环 + 卫星墨滴 + 立体墨珠 */
function InkOrbital3D({ className, label }: { className?: string, label: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('nv-spinner-3d motion-reduce:[--nv-spinner-speed:0s]', className)}
    >
      <span className="nv-spinner-3d__stage block size-full" aria-hidden>
        <span className="nv-spinner-3d__ring nv-spinner-3d__ring--a" />
        <span className="nv-spinner-3d__ring nv-spinner-3d__ring--b" />
        <span className="nv-spinner-3d__ring nv-spinner-3d__ring--c" />
        <span className="nv-spinner-3d__core" />
        {SATELLITE_PLANES.map((plane, i) => (
          <span
            key={plane}
            className={cn(
              'nv-spinner-3d__satellite',
              `nv-spinner-3d__satellite--${plane}`,
            )}
            style={{ animationDelay: `${i * -0.38}s` }}
          >
            <span className={cn('nv-spinner-3d__dot', i > 0 && 'nv-spinner-3d__dot--trail')} />
          </span>
        ))}
      </span>
    </span>
  )
}

/** 三颗墨滴绕 3D 三角轨道公转 */
function InkDots3D({ className, label }: { className?: string, label: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('nv-spinner-dots-3d inline-flex items-center justify-center', className)}
    >
      <span className="nv-spinner-dots-3d__orbit" aria-hidden>
        {DOT_ORBIT_ANGLES.map(angle => (
          <span
            key={angle}
            className="absolute inset-0"
            style={{ transform: `rotateZ(${angle}deg)` }}
          >
            <span className="nv-spinner-dots-3d__dot" />
          </span>
        ))}
      </span>
    </span>
  )
}

/** 钢笔落笔 + 3D 光晕轨道 */
function InkPen3D({ className, label }: { className?: string, label: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('nv-spinner-pen-3d inline-flex items-center gap-2.5 px-1', className)}
    >
      <span className="relative inline-flex size-7 items-center justify-center" aria-hidden>
        <span className="nv-spinner-pen-3d__halo">
          <span className="nv-spinner-pen-3d__halo-ring" />
          <span
            className="nv-spinner-pen-3d__halo-ring absolute inset-[15%]"
            style={{ animationDirection: 'reverse', animationDuration: '1.4s' }}
          />
        </span>
        <PenLine className="relative z-[1] size-4 agui-pen-sway drop-shadow-[0_2px_3px_color-mix(in_oklab,var(--foreground)_18%,transparent)]" />
      </span>
      <span className="inline-flex items-center gap-1" aria-hidden>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="agui-ink-drop size-1.5 rounded-full bg-current"
            style={{ animationDelay: `${i * 140}ms` }}
          />
        ))}
      </span>
    </span>
  )
}

function Spinner({
  className,
  variant = 'ring',
  label = 'Loading',
}: SpinnerProps) {
  const styles = spinnerVariants({ variant })

  if (variant === 'dots') {
    return <InkDots3D className={cn(styles, className)} label={label} />
  }

  if (variant === 'pen') {
    return <InkPen3D className={cn(styles, className)} label={label} />
  }

  return <InkOrbital3D className={cn(styles, className)} label={label} />
}

export { Spinner, spinnerVariants }
