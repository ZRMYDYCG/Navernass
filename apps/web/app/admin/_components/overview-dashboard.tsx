'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ADMIN_RESOURCE_GROUPS, ADMIN_RESOURCES, type AdminResourceStatKeys } from '@/lib/admin/resources'
import { useI18n } from '@/hooks/use-i18n'
import { AdminHeader } from './admin-header'

export function OverviewDashboard() {
  const { t } = useI18n()
  const [stats, setStats] = useState<AdminResourceStatKeys | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/admin/stats', { cache: 'no-store', credentials: 'include' })
        const result = await response.json()
        if (result.success && result.data) {
          setStats(result.data)
        }
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <>
      <AdminHeader title={t('admin.nav.overview')} description={t('admin.overviewDescription')} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          {ADMIN_RESOURCE_GROUPS.map((group) => (
            <section key={group.titleKey} className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">{t(group.titleKey)}</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {group.resources.map((resourceId) => {
                  const resource = ADMIN_RESOURCES[resourceId]
                  const count = resource.statKey && stats ? stats[resource.statKey] : 0

                  return (
                    <Link key={resourceId} href={`/admin/${resourceId}`}>
                      <Card className="transition-colors hover:bg-accent/40">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{t(resource.labelKey)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {loading
                            ? <Skeleton className="h-8 w-16" />
                            : (
                                <>
                                  <p className="text-3xl font-semibold text-foreground">{count}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">{t(resource.descriptionKey)}</p>
                                </>
                              )}
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
