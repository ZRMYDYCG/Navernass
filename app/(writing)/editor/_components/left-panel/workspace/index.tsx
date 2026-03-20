import type { Volume } from '../types'
import { ActionButtons } from './action-buttons'
import { QuickActions } from './quick-actions'
import { RecentChapters } from './recent-chapters'

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
  onImageGenerated?: (imageUrl: string) => void
}

const EMPTY_VOLUMES: Volume[] = []

export default function WorkspaceTab({
  chapters,
  novelId,
  volumes = EMPTY_VOLUMES,
  onChaptersImported,
  onCreateChapter,
  onSelectChapter,
  onImageGenerated,
}: WorkspaceTabProps) {
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-none">
      {/* 文件操作 */}
      <ActionButtons
        chapters={chapters}
        novelId={novelId}
        volumes={volumes}
        onChaptersImported={onChaptersImported}
      />

      {/* 快速操作 */}
      <QuickActions
        onCreateChapter={onCreateChapter}
        chapters={chapters.map(ch => ({ id: ch.id, title: ch.title }))}
        novelId={novelId}
        onChaptersChanged={onChaptersImported}
        chaptersCount={chapters.length}
        onImageGenerated={onImageGenerated}
      />

      {/* 最近编辑 */}
      <RecentChapters
        chapters={chapters}
        onSelectChapter={onSelectChapter}
      />
    </div>
  )
}
