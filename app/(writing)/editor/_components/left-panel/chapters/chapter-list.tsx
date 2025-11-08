'use client'

import type { DragEndEvent, DragOverEvent } from '@dnd-kit/core'
import type { Chapter, Volume } from '../types'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
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
import { VolumeItem } from './volume-item'

interface ChapterListProps {
  chapters: Chapter[]
  volumes: Volume[]
  selectedChapter: string | null
  onSelectChapter: (id: string) => void
  onReorderChapters?: (chapters: Array<{ id: string, order_index: number }>) => void
  onReorderVolumes?: (volumes: Array<{ id: string, order_index: number }>) => void
  onMoveChapterToVolume?: (chapterId: string, volumeId: string | null) => void
  onRenameChapter?: (chapter: Chapter) => void
  onDeleteChapter?: (chapter: Chapter) => void
  onRenameVolume?: (volume: Volume) => void
  onDeleteVolume?: (volume: Volume) => void
}

export function ChapterList({
  chapters,
  volumes,
  selectedChapter,
  onSelectChapter,
  onReorderChapters,
  onReorderVolumes,
  onMoveChapterToVolume,
  onRenameChapter,
  onDeleteChapter,
  onRenameVolume,
  onDeleteVolume,
}: ChapterListProps) {
  const [localChapters, setLocalChapters] = useState(() => chapters || [])
  const [localVolumes, setLocalVolumes] = useState(() => volumes || [])
  const [expandedVolumes, setExpandedVolumes] = useState<Set<string>>(() => new Set())
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // 同步外部数据变化
  useEffect(() => {
    if (JSON.stringify(chapters) !== JSON.stringify(localChapters)) {
      setLocalChapters(chapters || [])
    }
  }, [chapters, localChapters])

  useEffect(() => {
    if (JSON.stringify(volumes) !== JSON.stringify(localVolumes)) {
      setLocalVolumes(volumes || [])
    }
  }, [volumes, localVolumes])

  const toggleVolume = (volumeId: string) => {
    setExpandedVolumes((prev) => {
      const next = new Set(prev)
      if (next.has(volumeId)) {
        next.delete(volumeId)
      } else {
        next.add(volumeId)
      }
      return next
    })
  }

  // 获取没有卷的章节
  const chaptersWithoutVolume = localChapters.filter(c => !c.volume_id)

  // 获取每个卷下的章节
  const getVolumeChapters = (volumeId: string) => {
    return localChapters.filter(c => c.volume_id === volumeId)
  }

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    if (activeId === overId) return

    const activeChapter = localChapters.find(c => c.id === activeId)
    const overChapter = localChapters.find(c => c.id === overId)
    const overVolume = localVolumes.find(v => v.id === overId)

    // 如果拖拽的是章节
    if (activeChapter) {
      // 拖到卷上 - 移入卷
      if (overVolume) {
        if (activeChapter.volume_id !== overId) {
          // 立即移动章节到目标卷
          onMoveChapterToVolume?.(activeId, overId)
          // 自动展开目标卷
          setExpandedVolumes(prev => new Set(prev).add(overId))
        }
      }
      // 拖到另一个章节上
      else if (overChapter) {
        // 如果目标章节在根层级，且当前章节在卷内 - 移出卷
        if (!overChapter.volume_id && activeChapter.volume_id) {
          console.log('移出卷到根层级:', activeId)
          onMoveChapterToVolume?.(activeId, null)
          return
        }

        // 如果目标章节在卷内，且当前章节不在同一个卷 - 移入目标卷
        if (overChapter.volume_id && activeChapter.volume_id !== overChapter.volume_id) {
          console.log('移入目标卷:', activeId, '到', overChapter.volume_id)
          onMoveChapterToVolume?.(activeId, overChapter.volume_id)
          setExpandedVolumes(prev => new Set(prev).add(overChapter.volume_id!))
          return
        }

        // 在同一容器内排序
        const sameContainer = activeChapter.volume_id === overChapter.volume_id
        if (sameContainer) {
          const activeIndex = localChapters.findIndex(c => c.id === activeId)
          const overIndex = localChapters.findIndex(c => c.id === overId)

          if (activeIndex !== overIndex) {
            const newChapters = arrayMove(localChapters, activeIndex, overIndex)
            setLocalChapters(newChapters)
          }
        }
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)

    if (!over || active.id === over.id) return

    const activeId = String(active.id)
    const overId = String(over.id)

    const activeVolume = localVolumes.find(v => v.id === activeId)
    const overVolume = localVolumes.find(v => v.id === overId)
    const activeChapter = localChapters.find(c => c.id === activeId)
    const overChapter = localChapters.find(c => c.id === overId)

    // 拖拽卷 - 卷之间排序
    if (activeVolume && overVolume) {
      const oldIndex = localVolumes.findIndex(v => v.id === activeId)
      const newIndex = localVolumes.findIndex(v => v.id === overId)

      if (oldIndex !== newIndex) {
        const newVolumes = arrayMove(localVolumes, oldIndex, newIndex)
        setLocalVolumes(newVolumes)
        // 更新 order_index 并保存
        const volumesWithNewOrder = newVolumes.map((v, index) => ({
          ...v,
          order_index: index,
        }))
        onReorderVolumes?.(volumesWithNewOrder)
      }
    }
    // 拖拽章节
    else if (activeChapter) {
      // 拖到卷上 - 移入卷（在 handleDragOver 中已处理）
      if (overVolume) {
        return // 已在 dragOver 中处理
      }

      // 拖到章节上
      if (overChapter) {
        // 如果目标章节在根层级，且当前章节在卷内 - 移出卷
        if (!overChapter.volume_id && activeChapter.volume_id) {
          // 已在 dragOver 中处理，这里不需要再次调用
          return
        }

        // 如果目标章节在卷内，且当前章节不在同一个卷 - 移入目标卷
        if (overChapter.volume_id && activeChapter.volume_id !== overChapter.volume_id) {
          // 已在 dragOver 中处理
          return
        }

        // 在同一容器内排序
        if (activeChapter.volume_id === overChapter.volume_id) {
          const chaptersInContainer = localChapters.filter(
            c => c.volume_id === activeChapter.volume_id,
          )
          const oldIndex = chaptersInContainer.findIndex(c => c.id === activeId)
          const newIndex = chaptersInContainer.findIndex(c => c.id === overId)

          if (oldIndex !== newIndex) {
            const reorderedChapters = arrayMove(chaptersInContainer, oldIndex, newIndex)
            // 更新 order_index
            const chaptersWithNewOrder = reorderedChapters.map((c, index) => ({
              ...c,
              order_index: index,
            }))

            // 合并回完整列表
            const otherChapters = localChapters.filter(
              c => c.volume_id !== activeChapter.volume_id,
            )
            const newChapters = [...otherChapters, ...chaptersWithNewOrder]
            setLocalChapters(newChapters)
            onReorderChapters?.(chaptersWithNewOrder)
          }
        }
      }
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  // 获取当前拖拽的元素用于预览
  const activeItem = activeId
    ? localChapters.find(c => c.id === activeId) || localVolumes.find(v => v.id === activeId)
    : null

  // 创建所有可拖拽项的ID列表
  const sortableIds = [
    ...localVolumes.map(v => v.id),
    ...localChapters.map(c => c.id),
  ]

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-neutral-50 dark:scrollbar-track-neutral-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {/* 渲染卷和无卷的章节 */}
          {localVolumes.map(volume => (
            <VolumeItem
              key={volume.id}
              volume={volume}
              isExpanded={expandedVolumes.has(volume.id)}
              onToggle={() => toggleVolume(volume.id)}
              onRename={onRenameVolume}
              onDelete={onDeleteVolume}
            >
              {/* 卷下的章节 */}
              {getVolumeChapters(volume.id).map(chapter => (
                <ChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  isSelected={selectedChapter === chapter.id}
                  onSelect={() => onSelectChapter(chapter.id)}
                  onRename={onRenameChapter}
                  onDelete={onDeleteChapter}
                />
              ))}
            </VolumeItem>
          ))}

          {/* 没有卷的章节 */}
          {chaptersWithoutVolume.map(chapter => (
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

        {/* 拖拽预览 */}
        <DragOverlay dropAnimation={null}>
          {activeItem && 'title' in activeItem && 'wordCount' in activeItem
            ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700 opacity-90">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activeItem.title}
                  </div>
                </div>
              )
            : activeItem && 'description' in activeItem
              ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700 opacity-90">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      📁
                      {' '}
                      {activeItem.title}
                    </div>
                  </div>
                )
              : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
