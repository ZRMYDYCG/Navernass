'use client'

import { useI18n } from '@/hooks/use-i18n'
import { useWorkspaceStats } from '@/hooks/use-workspace-stats'
import { CharacterMap } from './_components/character-map'
import { GenreRadar } from './_components/genre-radar'
import { NovelStatusChart } from './_components/novel-status-chart'
import { StatsCards } from './_components/stats-cards'
import { WeatherWidget } from './_components/weather-widget'
import { WordCountTrend } from './_components/word-count-trend'
import { WritingCalendar } from './_components/writing-calendar'

export default function WorkspacePage() {
  const { t } = useI18n()
  const { data, isLoading } = useWorkspaceStats()

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('workspace.dashboard.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('workspace.dashboard.subtitle')}</p>
        </div>
        <WeatherWidget />
      </div>

      {/* 统计卡片 */}
      <StatsCards data={data?.summary} isLoading={isLoading} />

      {/* 图表行 1：趋势 + 状态分布 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <WordCountTrend data={data?.wordCountTrend} isLoading={isLoading} />
        <NovelStatusChart data={data?.novelStatusData} isLoading={isLoading} />
      </div>

      {/* 图表行 2：角色图谱 + 类型雷达 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CharacterMap data={data?.characterMapData} isLoading={isLoading} />
        <GenreRadar data={data?.genreRadarData} isLoading={isLoading} />
      </div>

      {/* 创作日历 */}
      <WritingCalendar data={data?.calendarData} isLoading={isLoading} />
    </div>
  )
}
