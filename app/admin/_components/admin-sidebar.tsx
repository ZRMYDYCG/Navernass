'use client'

import {
  BookOpen,
  ExternalLink,
  LayoutDashboard,
  MessageSquare,
  ShieldAlert,
  Users,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ADMIN_RESOURCE_GROUPS, ADMIN_RESOURCES } from '@/lib/admin/resources'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/use-i18n'
import { useThemeTransition } from '@/hooks/use-theme-transition'

const GROUP_ICONS = {
  'admin.groups.users': Users,
  'admin.groups.writing': BookOpen,
  'admin.groups.chat': MessageSquare,
  'admin.groups.community': ShieldAlert,
} as const

export function AdminSidebar() {
  const pathname = usePathname()
  const { t } = useI18n()
  const { resolvedTheme } = useThemeTransition()

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <Image
          src={resolvedTheme === 'dark' ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'}
          alt="Narraverse"
          width={28}
          height={28}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{t('admin.consoleTitle')}</p>
          <p className="truncate text-xs text-muted-foreground">{t('admin.consoleSubtitle')}</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-4">
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-sm transition-colors',
              pathname === '/admin'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/70',
            )}
          >
            <LayoutDashboard className="size-4" />
            <span>{t('admin.nav.overview')}</span>
          </Link>

          {ADMIN_RESOURCE_GROUPS.map((group) => {
            const Icon = GROUP_ICONS[group.titleKey as keyof typeof GROUP_ICONS] || ShieldAlert
            return (
              <div key={group.titleKey} className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Icon className="size-3.5" />
                  <span>{t(group.titleKey)}</span>
                </div>
                {group.resources.map((resourceId) => {
                  const resource = ADMIN_RESOURCES[resourceId]
                  const href = `/admin/${resourceId}`
                  const active = pathname === href

                  return (
                    <Link
                      key={resourceId}
                      href={href}
                      className={cn(
                        'block rounded-[var(--radius)] px-3 py-2 text-sm transition-colors',
                        active
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/70',
                      )}
                    >
                      {t(resource.labelKey)}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/workspace"
          className="flex items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/70"
        >
          <ExternalLink className="size-4" />
          <span>{t('admin.backToApp')}</span>
        </Link>
      </div>
    </aside>
  )
}
