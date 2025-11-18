/* eslint-disable react/no-array-index-key */
'use client'

import { gsap } from 'gsap'
import Image from 'next/image'
import { useEffect, useRef } from 'react'

const CORE_VALUES = [
  '为才华横溢的创作者打造舒适的创作环境',
  '降低优质内容被看见、被分享、被发掘的门槛',
  '为新手提供 AI 辅助，降低走进创作的门槛',
]

export function EmptyState() {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const valuesRef = useRef<(HTMLParagraphElement | null)[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from(logoRef.current, {
        y: -100,
        scale: 0,
        rotation: -180,
        opacity: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.6)',
      })

      tl.to(logoRef.current, {
        y: -5,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      }, '-=0.5')

      tl.from(
        valuesRef.current,
        {
          y: 50,
          opacity: 0,
          filter: 'blur(10px)',
          stagger: 0.2,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.8',
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col items-center justify-center text-center px-6"
    >
      <div ref={logoRef} className="relative z-10">
        <div className="w-28 h-28 flex items-center justify-center">
          <Image
            src="/assets/svg/logo-dark.svg"
            width={96}
            height={96}
            alt="Narraverse"
            className="dark:hidden drop-shadow-2xl"
            priority
          />
          <Image
            src="/assets/svg/logo-light.svg"
            width={96}
            height={96}
            alt="Narraverse"
            className="hidden dark:block drop-shadow-2xl"
            priority
          />
        </div>
      </div>

      <div className="max-w-lg space-y-1 relative z-10">
        {CORE_VALUES.map((value, index) => (
          <p
            key={index}
            ref={(el) => {
              valuesRef.current[index] = el
            }}
            className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-light tracking-wide"
          >
            {value}
          </p>
        ))}
      </div>
    </div>
  )
}
