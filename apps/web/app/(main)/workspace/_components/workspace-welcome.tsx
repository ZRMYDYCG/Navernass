'use client'

import { PenLine, Plus } from 'lucide-react'
import Link from 'next/link'
import { SidebarOpenButton } from '@/app/(main)/_components/layouts/sidebar-open-button'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'
import { LocaleContext } from './locale-context'

type TimeSlot = 'morning' | 'noon' | 'afternoon' | 'evening' | 'night'

function getTimeSlot(hour: number): TimeSlot {
  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 14) return 'noon'
  if (hour >= 14 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}

export function WorkspaceWelcome() {
  const { t } = useI18n()
  const slot = getTimeSlot(new Date().getHours())

  return (
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <SidebarOpenButton />
        <div className="min-w-0">
          <p className="sidebar-group-label">
            {t(`workspace.welcome.timeConfig.${slot}.greeting`)}
          </p>
          <h1 className="mt-1 text-2xl font-serif font-medium text-balance text-foreground md:text-3xl">
            {t('workspace.dashboard.title')}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-pretty text-muted-foreground leading-relaxed">
            {t(`workspace.welcome.timeConfig.${slot}.message`)}
          </p>
          <blockquote className="mt-4 text-sm italic text-muted-foreground/80">
            {t('workspace.page.quote')}
            <footer className="mt-1 text-xs not-italic text-muted-foreground/60">
              —
              {' '}
              {t('workspace.page.author')}
            </footer>
          </blockquote>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        <LocaleContext />
        <Button asChild size="sm" className="font-sans">
          <Link href="/novels?action=create">
            <Plus />
            {t('workspace.projectList.createNew')}
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="font-sans">
          <Link href="/novels">
            <PenLine />
            {t('workspace.allNovels')}
          </Link>
        </Button>
      </div>
    </header>
  )
}
