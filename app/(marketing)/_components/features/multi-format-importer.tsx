'use client'

import { User } from 'lucide-react'
import Image from 'next/image'
import React, { useRef } from 'react'
import { AnimatedBeam } from '@/components/ui/animated-beam'
import { useThemeTransition } from '@/hooks/use-theme-transition'
import { cn } from '@/lib/utils'

function Circle({ ref, className, children }: { className?: string, children?: React.ReactNode } & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={ref}
      className={cn(
        'z-10 select-none dark:text-black flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

Circle.displayName = 'Circle'

export function AnimatedBeamMultipleOutputDemo({
  className,
}: {
  className?: string
}) {
  const { resolvedTheme } = useThemeTransition()

  const containerRef = useRef<HTMLDivElement>(null)
  const div1Ref = useRef<HTMLDivElement>(null)
  const div2Ref = useRef<HTMLDivElement>(null)

  const div6Ref = useRef<HTMLDivElement>(null)
  const div7Ref = useRef<HTMLDivElement>(null)

  return (
    <div
      className={cn(
        'relative flex h-[500px] w-full items-center justify-center overflow-hidden p-10',
        className,
      )}
      ref={containerRef}
    >
      <div className="flex size-full max-w-lg flex-row items-stretch justify-between gap-10">
        <div className="flex flex-col justify-center">
          <Circle ref={div7Ref}>
            <User />
          </Circle>
        </div>

        <div className="flex flex-col justify-center">
          <Circle ref={div6Ref} className="size-16">
            <Image
              src={resolvedTheme === 'dark' ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'}
              width={32}
              height={32}
              alt="Narraverse"
            />
          </Circle>
        </div>

        <div className="flex flex-col justify-center gap-2">
          <Circle ref={div1Ref}>
            M
          </Circle>
          <Circle ref={div2Ref}>
            T
          </Circle>

        </div>
      </div>

      {/* AnimatedBeams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div6Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div6Ref}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div7Ref}
        duration={3}
      />
    </div>
  )
}
