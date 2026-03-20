import type { Chapter, LeftTabType, Volume } from './types'
import ChaptersTab from './chapters'
import { SearchTab } from './search-tab'
import { TabSwitcher } from './tab-switcher'
import WorkspaceTab from './workspace'

interface LeftPanelProps {
  novelTitle?: string
  novelId: string
  chapters: Chapter[]
  volumes?: Volume[]
  selectedChapter: string | null
  activeTab: LeftTabType
  onTabChange: (tab: LeftTabType) => void
  onSelectChapter: (id: string) => void
  onCreateChapter?: () => void
  onCreateChapterQuick?: () => void
  onCreateChapterInVolume?: (volumeId: string) => void
  onCreateVolume?: () => void
  onCreateVolumeQuick?: () => void
  onReorderChapters?: (chapters: Array<{ id: string, order_index: number }>) => void
  onReorderVolumes?: (volumes: Array<{ id: string, order_index: number }>) => void
  onMoveChapterToVolume?: (chapterId: string, volumeId: string | null) => void
  onRenameChapter?: (chapter: Chapter) => void
  onRenameChapterInline?: (chapterId: string, title: string) => Promise<void> | void
  onDeleteChapter?: (chapter: Chapter) => void
  onCopyChapter?: (chapter: Chapter) => Promise<void>
  onMoveChapter?: (chapter: Chapter) => void
  onRenameVolume?: (volume: Volume) => void
  onDeleteVolume?: (volume: Volume) => void
  onChaptersImported?: () => void
  onImageGenerated?: (imageUrl: string) => void
  onToggleCharacters?: () => void
}

export default function LeftPanel({
  novelTitle,
  novelId,
  chapters,
  volumes = [],
  selectedChapter,
  activeTab,
  onTabChange,
  onSelectChapter,
  onCreateChapter,
  onCreateChapterQuick,
  onCreateChapterInVolume,
  onCreateVolume,
  onCreateVolumeQuick,
  onReorderChapters,
  onReorderVolumes,
  onMoveChapterToVolume,
  onRenameChapter,
  onRenameChapterInline,
  onDeleteChapter,
  onCopyChapter,
  onMoveChapter,
  onRenameVolume,
  onDeleteVolume,
  onChaptersImported,
  onImageGenerated,
  onToggleCharacters,
}: LeftPanelProps) {
  return (
    <div
      className="h-full flex border-r-0 rounded-none shadow-none isolate"
    >
      <div className="flex-shrink-0 bg-background/90 border-r border-border">
        <TabSwitcher activeTab={activeTab} onChange={onTabChange} onToggleCharacters={onToggleCharacters} />
      </div>

      <div className="flex-1 overflow-hidden relative bg-background">
        {activeTab === 'files' && (
          <div className="h-full w-full absolute inset-0">
            <ChaptersTab
              novelTitle={novelTitle}
              chapters={chapters}
              volumes={volumes}
              selectedChapter={selectedChapter}
              onSelectChapter={onSelectChapter}
              onCreateChapter={onCreateChapter}
              onCreateChapterQuick={onCreateChapterQuick}
              onCreateChapterInVolume={onCreateChapterInVolume}
              onCreateVolume={onCreateVolume}
              onCreateVolumeQuick={onCreateVolumeQuick}
              onReorderChapters={onReorderChapters}
              onReorderVolumes={onReorderVolumes}
              onMoveChapterToVolume={onMoveChapterToVolume}
              onRenameChapter={onRenameChapter}
              onRenameChapterInline={onRenameChapterInline}
              onDeleteChapter={onDeleteChapter}
              onCopyChapter={onCopyChapter}
              onMoveChapter={onMoveChapter}
              onRenameVolume={onRenameVolume}
              onDeleteVolume={onDeleteVolume}
            />
          </div>
        )}

        {activeTab === 'search' && (
          <div className="h-full w-full absolute inset-0">
            <SearchTab
              novelId={novelId}
              volumes={volumes}
              selectedChapter={selectedChapter}
              onSelectChapter={onSelectChapter}
            />
          </div>
        )}

        {activeTab === 'workspace' && (
          <div className="h-full w-full absolute inset-0">
            <WorkspaceTab
              chapters={chapters.map((c) => {
                const wordCountStr = c.wordCount || '0'
                const wordCountNum = Number.parseFloat(wordCountStr.replace(/[^0-9.]/g, '')) || 0
                const multiplier = wordCountStr.includes('k') ? 1000 : 1
                return {
                  id: c.id,
                  title: c.title,
                  word_count: wordCountNum * multiplier,
                  updated_at: (c as { updated_at?: string }).updated_at,
                }
              })}
              novelId={novelId}
              volumes={volumes}
              onChaptersImported={onChaptersImported}
              onCreateChapter={onCreateChapter}
              onSelectChapter={onSelectChapter}
              onImageGenerated={onImageGenerated}
            />
          </div>
        )}
      </div>
    </div>
  )
}
