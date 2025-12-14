import type { Chapter, LeftTabType, Volume } from './types'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { paperSlideInRight } from '@/components/motion/config'
import { CharacterShowcase } from '../character-showcase'
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
  onSelectChapter: (id: string) => void
  onCreateChapter?: () => void
  onCreateChapterInVolume?: (volumeId: string) => void
  onCreateVolume?: () => void
  onReorderChapters?: (chapters: Array<{ id: string, order_index: number }>) => void
  onReorderVolumes?: (volumes: Array<{ id: string, order_index: number }>) => void
  onMoveChapterToVolume?: (chapterId: string, volumeId: string | null) => void
  onRenameChapter?: (chapter: Chapter) => void
  onDeleteChapter?: (chapter: Chapter) => void
  onCopyChapter?: (chapter: Chapter) => Promise<void>
  onMoveChapter?: (chapter: Chapter) => void
  onRenameVolume?: (volume: Volume) => void
  onDeleteVolume?: (volume: Volume) => void
  onChaptersImported?: () => void
}

export default function LeftPanel({
  novelTitle,
  novelId,
  chapters,
  volumes = [],
  selectedChapter,
  onSelectChapter,
  onCreateChapter,
  onCreateChapterInVolume,
  onCreateVolume,
  onReorderChapters,
  onReorderVolumes,
  onMoveChapterToVolume,
  onRenameChapter,
  onDeleteChapter,
  onCopyChapter,
  onMoveChapter,
  onRenameVolume,
  onDeleteVolume,
  onChaptersImported,
}: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<LeftTabType>('files')

  return (
    <div
      className="h-full flex border-r-0 rounded-none shadow-none"
    >
      <div className="flex-shrink-0 z-10 bg-[#FAF9F6] dark:bg-zinc-900/90 border-r border-stone-200 dark:border-zinc-800">
        <TabSwitcher activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-hidden relative bg-[#FAF9F6] dark:bg-zinc-900">
        <AnimatePresence mode="wait">
          {activeTab === 'files' && (
            <motion.div
              key="files"
              variants={paperSlideInRight}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full w-full absolute inset-0"
            >
              <ChaptersTab
                novelTitle={novelTitle}
                chapters={chapters}
                volumes={volumes}
                selectedChapter={selectedChapter}
                onSelectChapter={onSelectChapter}
                onCreateChapter={onCreateChapter}
                onCreateChapterInVolume={onCreateChapterInVolume}
                onCreateVolume={onCreateVolume}
                onReorderChapters={onReorderChapters}
                onReorderVolumes={onReorderVolumes}
                onMoveChapterToVolume={onMoveChapterToVolume}
                onRenameChapter={onRenameChapter}
                onDeleteChapter={onDeleteChapter}
                onCopyChapter={onCopyChapter}
                onMoveChapter={onMoveChapter}
                onRenameVolume={onRenameVolume}
                onDeleteVolume={onDeleteVolume}
              />
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search"
              variants={paperSlideInRight}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full w-full absolute inset-0"
            >
              <SearchTab
                novelId={novelId}
                volumes={volumes}
                selectedChapter={selectedChapter}
                onSelectChapter={onSelectChapter}
              />
            </motion.div>
          )}

          {activeTab === 'characters' && (
            <motion.div
              key="characters"
              variants={paperSlideInRight}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full w-full absolute inset-0"
            >
              <CharacterShowcase novelId={novelId} />
            </motion.div>
          )}

          {activeTab === 'workspace' && (
            <motion.div
              key="workspace"
              variants={paperSlideInRight}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full w-full absolute inset-0"
            >
              <WorkspaceTab
                chapters={chapters.map((c) => {
                  // 从 wordCount 字符串中提取数字（如 "1.5k字" -> 1500）
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
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
