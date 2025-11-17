import type { Volume } from '../types'
import { ActionButtons } from './action-buttons'
import { QuickActions } from './quick-actions'
import { RecentChapters } from './recent-chapters'
import { StatisticsCard } from './statistics-card'
import { WritingTools } from './writing-tools'

interface Chapter {
  id: string
  title: string
  word_count?: number
  updated_at?: string
}

interface WorkspaceTabProps {
  chapters: Chapter[]
  novelId: string
  volumes?: Volume[]
  onChaptersImported?: () => void
  onCreateChapter?: () => void
  onSelectChapter?: (chapterId: string) => void
}

const EMPTY_VOLUMES: Volume[] = []

export default function WorkspaceTab({
  chapters,
  novelId,
  volumes = EMPTY_VOLUMES,
  onChaptersImported,
  onCreateChapter,
  onSelectChapter,
}: WorkspaceTabProps) {
  // 计算统计数据
  const totalWords = chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0)
  const totalChapters = chapters.length
  const totalVolumes = volumes.length

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-zinc-800">
      <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-zinc-800 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-neutral-50 dark:scrollbar-track-neutral-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full px-1.5 py-2 space-y-2.5">
        {/* 统计信息 */}
        <StatisticsCard
          totalWords={totalWords}
          totalChapters={totalChapters}
          totalVolumes={totalVolumes}
        />

        {/* 文件操作 */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 px-1">
            文件操作
          </h3>
          <ActionButtons
            chapters={chapters}
            novelId={novelId}
            volumes={volumes}
            onChaptersImported={onChaptersImported}
          />
        </div>

        {/* 快速操作 */}
        <QuickActions
          onCreateChapter={onCreateChapter}
          chapters={chapters.map(ch => ({ id: ch.id, title: ch.title }))}
          novelId={novelId}
          onChaptersChanged={onChaptersImported}
          chaptersCount={chapters.length}
        />

        {/* 最近编辑 */}
        <RecentChapters
          chapters={chapters}
          onSelectChapter={onSelectChapter}
        />

        {/* 写作工具 */}
        <WritingTools novelId={novelId} />
      </div>
    </div>
  )
}
