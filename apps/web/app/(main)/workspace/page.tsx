'use client'

import { useI18n } from '@/hooks/use-i18n'
import { useWorkspaceStats } from '@/hooks/use-workspace-stats'
import { CharacterMap } from './_components/character-map'
import { GenreRadar } from './_components/genre-radar'
import { NovelStatusChart } from './_components/novel-status-chart'
import { StatsCards } from './_components/stats-cards'
import { WordCountTrend } from './_components/word-count-trend'
import { WorkspaceWelcome } from './_components/workspace-welcome'
import { WritingCalendar } from './_components/writing-calendar'

export default function WorkspacePage() {
  const { t } = useI18n()
  const { data, isLoading } = useWorkspaceStats()

  return (
    <div className="flex h-full flex-col bg-background font-serif transition-colors">
      <div className="flex-1 overflow-y-auto px-6 py-5 md:px-8 md:py-6">
        <WorkspaceWelcome />

        <section aria-label={t('workspace.statsCard.title')}>
          <StatsCards data={data?.summary} isLoading={isLoading} />
        </section>

        <section className="mt-8 space-y-4" aria-label={t('workspace.dashboard.wordCountTrend.title')}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <WordCountTrend data={data?.wordCountTrend} isLoading={isLoading} />
            <NovelStatusChart data={data?.novelStatusData} isLoading={isLoading} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CharacterMap data={data?.characterMapData} isLoading={isLoading} />
            <GenreRadar data={data?.genreRadarData} isLoading={isLoading} />
          </div>

          <WritingCalendar data={data?.calendarData} isLoading={isLoading} />
        </section>
      </div>
    </div>
  )
}
