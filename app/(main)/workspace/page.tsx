'use client'

import { useI18n } from '@/hooks/use-i18n'
import { ContributionGraph } from './_components/contribution-graph'
import { ProjectList } from './_components/project-list'
import { StatsCard } from './_components/stats-card'
import { WelcomeCard } from './_components/welcome-card'

export default function WorkspacePage() {
  const { t } = useI18n()

  return (
    <div className="container mx-auto max-w-[1200px] space-y-8 px-4 py-8 md:py-12 animate-in fade-in duration-700">
      <WelcomeCard />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <ProjectList />
        </div>

        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-8">
          <StatsCard />
          <ContributionGraph />

          <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 text-center shadow-paper-sm group hover:shadow-paper-md transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="mb-4 text-4xl text-primary/20 font-serif">"</div>
            <p className="font-serif italic text-foreground/80 text-base leading-relaxed tracking-wide mb-4">
              {t('workspace.page.quote')}
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-border" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                {t('workspace.page.author')}
              </p>
              <div className="h-px w-8 bg-border" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
