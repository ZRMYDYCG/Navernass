import type {
  DragEndEvent,
} from '@dnd-kit/core'
import type { Chapter } from '../types'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'
import { ChapterItem } from './chapter-item'

interface ChapterListProps {
  chapters: Chapter[]
  selectedChapter: string | null
  onSelectChapter: (id: string) => void
  onReorderChapters?: (chapters: Chapter[]) => void
  onRenameChapter?: (chapter: Chapter) => void
  onDeleteChapter?: (chapter: Chapter) => void
}

export function ChapterList({
  chapters,
  selectedChapter,
  onSelectChapter,
  onReorderChapters,
  onRenameChapter,
  onDeleteChapter,
}: ChapterListProps) {
  const [items, setItems] = useState(chapters)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // 同步外部 chapters 变化
  useEffect(() => {
    setItems(chapters)
  }, [chapters])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)
      onReorderChapters?.(newItems)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-neutral-50 dark:scrollbar-track-neutral-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          {items.map(chapter => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              isSelected={selectedChapter === chapter.id}
              onSelect={() => onSelectChapter(chapter.id)}
              onRename={onRenameChapter}
              onDelete={onDeleteChapter}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
