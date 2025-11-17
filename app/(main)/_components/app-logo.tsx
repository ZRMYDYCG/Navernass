'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export function AppLogo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-zinc-800 animate-pulse" />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <div className="relative w-10 h-10 shrink-0">
      <Image
        src={isDark ? '/assets/svg/logo-dark.svg' : '/assets/svg/logo-light.svg'}
        alt="Narraverse Logo"
        width={40}
        height={40}
        priority
        className="object-contain"
      />
    </div>
  )
}
