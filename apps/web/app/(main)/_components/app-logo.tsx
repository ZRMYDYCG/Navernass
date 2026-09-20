'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'

export function AppLogo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-secondary animate-pulse" />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <div className="relative w-10 h-10 shrink-0">
      <Image
        src={isDark ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'}
        alt={t('main.appLogo.alt')}
        width={40}
        height={40}
        priority
        className="object-contain"
      />
    </div>
  )
}
