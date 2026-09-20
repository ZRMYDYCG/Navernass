'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { useI18n } from '@/hooks/use-i18n'

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { t } = useI18n()
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false

    async function verify() {
      try {
        const response = await fetch('/api/admin/me', {
          credentials: 'include',
          cache: 'no-store',
        })
        const result = await response.json()
        if (cancelled) return

        if (result?.data?.isSuperAdmin) {
          setAuthorized(true)
          return
        }

        router.replace('/')
      } catch {
        if (!cancelled) router.replace('/')
      }
    }

    verify()

    return () => {
      cancelled = true
    }
  }, [router])

  if (authorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Spinner className="size-6" />
          <p className="text-sm">{t('admin.loading')}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
