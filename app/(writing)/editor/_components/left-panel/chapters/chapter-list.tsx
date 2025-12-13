'use client'

import type { DragEndEvent, DragOverEvent } from '@dnd-kit/core'
import type { Chapter, Volume } from '../types'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDroppable,
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

// 根目录放置区组件
function RootDropZone({ id, isOver, isDraggingFromVolume }: { id: string, isOver: boolean, isDraggingFromVolume: boolean }) {
  const { setNodeRef } = useDroppable({ id })

  if (!isDraggingFromVolume) {
    return null
  }

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 ${
        isOver
          ? 'h-16 mb-1 border-2 border-dashed border-stone-300 dark:border-zinc-600 rounded-lg flex items-center justify-center bg-stone-50 dark:bg-zinc-800/50'
          : 'h-12 mb-1 border-2 border-dashed border-stone-200 dark:border-zinc-700 rounded-lg flex items-center justify-center opacity-60 hover:opacity-100 hover:border-stone-300 dark:hover:border-zinc-600'
      }`}
    >
      <span className="text-sm text-stone-500 dark:text-zinc-400">
        {isOver ? '松开以移出到根目录' : '拖到这里移出到根目录'}
      </span>
    </div>
  )
}

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
  onCopyChapter?: (chapter: Chapter) => Promise<void>
  onRenameVolume?: (volume: Volume) => void
  onDeleteVolume?: (volume: Volume) => void
  onCreateChapterInVolume?: (volumeId: string) => void
  onCollapseAllRef?: React.MutableRefObject<(() => void) | null>
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
  onCopyChapter,
  onRenameVolume,
  onDeleteVolume,
  onCreateChapterInVolume,
  onCollapseAllRef,
}: ChapterListProps) {
  const [localChapters, setLocalChapters] = useState(() => chapters || [])
  const [localVolumes, setLocalVolumes] = useState(() => volumes || [])
  const [expandedVolumes, setExpandedVolumes] = useState<Set<string>>(() => new Set())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  // 暴露收起所有卷的方法给父组件
  useEffect(() => {
    if (onCollapseAllRef) {
      onCollapseAllRef.current = () => {
        setExpandedVolumes(new Set())
      }
    }
  }, [onCollapseAllRef])

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

  // 同步外部数据变化（需要在 props 变化时更新本地状态）
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  useEffect(() => {
    setLocalChapters(chapters || [])
    // eslint-disable-next-line react-compiler/react-compiler
  }, [chapters])

  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  useEffect(() => {
    setLocalVolumes(volumes || [])
    // eslint-disable-next-line react-compiler/react-compiler
  }, [volumes])

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

  // 根目录放置区 ID（用于将章节从卷中移出）
  const ROOT_DROP_ZONE_ID = 'root-drop-zone'

  // 获取没有卷的章节
  const chaptersWithoutVolume = localChapters.filter(c => !c.volume_id)

  // 获取每个卷下的章节
  const getVolumeChapters = (volumeId: string) => {
    return localChapters.filter(c => c.volume_id === volumeId)
  }

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(String(event.active.id))
    setOverId(null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) {
      setOverId(null)
      return
    }

    const activeId = String(active.id)
    const currentOverId = String(over.id)

    // 更新 overId 用于显示插入指示（只做视觉反馈，不移动元素）
    setOverId(currentOverId)

    if (activeId === currentOverId) return

    const activeChapter = localChapters.find(c => c.id === activeId)
    const overVolume = localVolumes.find(v => v.id === currentOverId)

    // 如果拖拽的是章节
    if (activeChapter) {
      // 拖到卷上 - 只展开卷，不做其他操作
      if (overVolume) {
        if (activeChapter.volume_id !== currentOverId) {
          // 只是自动展开目标卷，不移动章节
          setExpandedVolumes(prev => new Set(prev).add(currentOverId))
        }
      }
      // 拖到根目录放置区
      if (currentOverId === ROOT_DROP_ZONE_ID && activeChapter.volume_id) {
        // 只显示视觉指示，不移动元素
      }
    }
    // 其他情况只显示视觉指示，不移动元素
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)
    setOverId(null)

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
    } else if (activeChapter) {
      // 拖拽章节
      // 拖到根目录放置区 - 移出卷
      if (overId === ROOT_DROP_ZONE_ID && activeChapter.volume_id) {
        onMoveChapterToVolume?.(activeId, null)
        return
      }

      // 拖到卷上 - 移入卷（松开鼠标时才执行）
      if (overVolume) {
        if (activeChapter.volume_id !== overId) {
          onMoveChapterToVolume?.(activeId, overId)
        }
        return
      }

      // 拖到章节上
      if (overChapter) {
        // 如果目标章节在根层级，且当前章节在卷内 - 移出卷
        if (!overChapter.volume_id && activeChapter.volume_id) {
          onMoveChapterToVolume?.(activeId, null)
          return
        }

        // 如果目标章节在卷内，且当前章节不在同一个卷 - 移入目标卷
        if (overChapter.volume_id && activeChapter.volume_id !== overChapter.volume_id) {
          onMoveChapterToVolume?.(activeId, overChapter.volume_id)
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
    setOverId(null)
  }

  // 获取当前拖拽的元素用于预览
  const activeItem = activeId
    ? localChapters.find(c => c.id === activeId) || localVolumes.find(v => v.id === activeId)
    : null

  // 创建所有可拖拽项的ID列表
  const sortableIds = [
    ROOT_DROP_ZONE_ID,
    ...localVolumes.map(v => v.id),
    ...localChapters.map(c => c.id),
  ]

  return (
    <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {/* 根目录放置区 - 用于移出卷 */}
          <RootDropZone
            id={ROOT_DROP_ZONE_ID}
            isOver={overId === ROOT_DROP_ZONE_ID}
            isDraggingFromVolume={!!(activeId && localChapters.find(c => c.id === activeId && c.volume_id))}
          />

          {/* 渲染卷和无卷的章节 */}
          {localVolumes.map(volume => (
            <div
              key={volume.id}
              className={overId === volume.id && activeId && localChapters.find(c => c.id === activeId)
                ? 'border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg'
                : ''}
            >
              <VolumeItem
                volume={volume}
                isExpanded={expandedVolumes.has(volume.id)}
                onToggle={() => toggleVolume(volume.id)}
                onRename={onRenameVolume}
                onDelete={onDeleteVolume}
                onCreateChapter={onCreateChapterInVolume}
              >
                {/* 卷下的章节 */}
                {getVolumeChapters(volume.id).map((chapter, index) => {
                  const isOver = overId === chapter.id && activeId !== chapter.id
                  const activeChapter = localChapters.find(c => c.id === activeId)
                  const sameContainer = activeChapter?.volume_id === chapter.volume_id

                  return (
                    <div key={chapter.id} className="relative">
                      {/* 顶部插入指示线 */}
                      {isOver && sameContainer && index === 0 && (
                        <div className="absolute -top-px left-4 right-4 border-t-2 border-dashed border-gray-400 dark:border-gray-500 z-10" />
                      )}

                      <div
                        className={isOver
                          ? 'bg-stone-100 dark:bg-zinc-800 transition-colors rounded-lg'
                          : ''}
                      >
                        <ChapterItem
                          chapter={chapter}
                          isSelected={selectedChapter === chapter.id}
                          onSelect={() => onSelectChapter(chapter.id)}
                          onRename={onRenameChapter}
                          onDelete={onDeleteChapter}
                          onCopy={onCopyChapter}
                        />
                      </div>

                      {/* 底部插入指示线 */}
                      {isOver && sameContainer && (
                        <div className="absolute -bottom-px left-4 right-4 border-t-2 border-dashed border-gray-400 dark:border-gray-500 z-10" />
                      )}
                    </div>
                  )
                })}
              </VolumeItem>
            </div>
          ))}

          {/* 没有卷的章节 */}
          {chaptersWithoutVolume.map((chapter, index) => {
            const isOver = overId === chapter.id && activeId !== chapter.id
            const activeChapter = localChapters.find(c => c.id === activeId)
            const sameContainer = !activeChapter?.volume_id && !chapter.volume_id

            return (
              <div key={chapter.id} className="relative">
                {/* 顶部插入指示线 */}
                {isOver && sameContainer && index === 0 && (
                  <div className="absolute -top-px left-4 right-4 border-t-2 border-dashed border-gray-400 dark:border-gray-500 z-10" />
                )}

                <div
                  className={isOver
                    ? 'bg-stone-100 dark:bg-zinc-800 transition-colors rounded-lg'
                    : ''}
                >
                  <ChapterItem
                    chapter={chapter}
                    isSelected={selectedChapter === chapter.id}
                    onSelect={() => onSelectChapter(chapter.id)}
                    onRename={onRenameChapter}
                    onDelete={onDeleteChapter}
                    onCopy={onCopyChapter}
                  />
                </div>

                {/* 底部插入指示线 */}
                {isOver && sameContainer && (
                  <div className="absolute -bottom-px left-4 right-4 border-t-2 border-dashed border-gray-400 dark:border-gray-500 z-10" />
                )}
              </div>
            )
          })}
        </SortableContext>

        {/* 拖拽预览 */}
        <DragOverlay dropAnimation={null}>
          {activeItem && 'title' in activeItem && 'wordCount' in activeItem
            ? (
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-3 border-2 border-dashed border-gray-400 dark:border-gray-600">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {activeItem.title}
                  </div>
                </div>
              )
            : activeItem && 'description' in activeItem
              ? (
                  <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-3 border-2 border-dashed border-gray-400 dark:border-gray-600">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
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
