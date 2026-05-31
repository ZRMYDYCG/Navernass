'use client'

import { Moon, Sun } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/use-auth'
import { useI18n } from '@/hooks/use-i18n'
import { useThemeTransition } from '@/hooks/use-theme-transition'

interface AdminHeaderProps {
  title: string
  description?: string
}

export function AdminHeader({ title, description }: AdminHeaderProps) {
  const { t } = useI18n()
  const { user, profile } = useAuth()
  const { resolvedTheme, setTheme } = useThemeTransition()

  const displayName = profile?.full_name || profile?.username || user?.email || t('common.user')

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center justify-between gap-4 px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
            <Badge variant="secondary">{t('admin.superAdminBadge')}</Badge>
          </div>
          {description
            ? <p className="truncate text-sm text-muted-foreground">{description}</p>
            : null}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={(event) => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark', event)}
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
