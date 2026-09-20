'use client'

import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import type { Chapter, Volume } from '../types'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
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
import { FileText } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { ChapterItem } from './chapter-item'
import { EmptyChapters } from './empty-chapters'
import { VolumeItem } from './volume-item'

const ROOT_DROP_ZONE_ID = '__root__'

function normalizeVolumeId(volumeId: string | null | undefined): string | null {
  return volumeId ?? null
}

function sameVolume(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  return normalizeVolumeId(a) === normalizeVolumeId(b)
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
  onRenameChapterInline?: (chapterId: string, title: string) => Promise<void> | void
  onDeleteChapter?: (chapter: Chapter) => void
  onCopyChapter?: (chapter: Chapter) => Promise<void>
  onMoveChapter?: (chapter: Chapter) => void
  onRenameVolume?: (volume: Volume) => void
  onDeleteVolume?: (volume: Volume) => void
  onCreateChapterInVolume?: (volumeId: string) => void
  onCreateChapter?: () => void
  onCreateVolume?: () => void
  onToggleAllVolumesRef?: React.MutableRefObject<(() => void) | null>
  onAllVolumesExpandedChange?: (expanded: boolean) => void
  onHasVolumesChange?: (hasVolumes: boolean) => void
}

/**
 * 章节/卷拖拽（"刀切式"重排）
 *
 * 核心交互：
 *   - 拖动时，鼠标悬停的目标行立即让位——拖动项落入它的位置
 *   - 不靠 useSortable.transform 平移其他项（那种"漂浮感"是体验糟糕的根因）
 *   - 而是在 onDragOver 中实时 arrayMove 更新 localChapters/localVolumes
 *     列表顺序立即变化，浏览器自然布局到新位置
 *
 * 范围：
 *   - 卷之间排序
 *   - 同卷内章节排序
 *   - 跨卷拖章节（自动以目标章节所在卷为准）
 *   - 拖章节到卷标题（移入该卷尾部）
 *   - 拖卷内章节到顶部"根目录"提示条（移出卷）
 *
 * 落库：onDragEnd 时把最终顺序通过 onReorderChapters / onMoveChapterToVolume 上报。
 */
export function ChapterList({
  chapters,
  volumes,
  selectedChapter,
  onSelectChapter,
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
  onCreateChapterInVolume,
  onCreateChapter,
  onCreateVolume,
  onToggleAllVolumesRef,
  onAllVolumesExpandedChange,
  onHasVolumesChange,
}: ChapterListProps) {
  const { t } = useI18n()
  const [localChapters, setLocalChapters] = useState<Chapter[]>(() => chapters || [])
  const [localVolumes, setLocalVolumes] = useState<Volume[]>(() => volumes || [])
  const [expandedVolumes, setExpandedVolumes] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string | null>(null)

  // dragStart 时记录 active 项的初始容器（卷 id），用于 dragEnd 判断是否跨卷
  const startVolumeIdRef = useRef<string | null | undefined>(undefined)
  const lastHasVolumesRef = useRef<boolean | null>(null)
  const lastAllExpandedRef = useRef<boolean | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // props 同步：拖动中暂停同步避免抖动
  useEffect(() => {
    if (activeId) return
    setLocalChapters(chapters || [])
  }, [chapters, activeId])

  useEffect(() => {
    if (activeId) return
    setLocalVolumes(volumes || [])
    if (volumes && volumes.length > 0) {
      setExpandedVolumes(prev => prev.size === 0 ? new Set(volumes.map(v => v.id)) : prev)
    }
  }, [volumes, activeId])

  const allVolumesExpanded = localVolumes.length > 0
    && localVolumes.every(v => expandedVolumes.has(v.id))

  useEffect(() => {
    const hasVolumes = localVolumes.length > 0
    if (lastHasVolumesRef.current === hasVolumes) return
    lastHasVolumesRef.current = hasVolumes
    onHasVolumesChange?.(hasVolumes)
  }, [localVolumes.length, onHasVolumesChange])

  useEffect(() => {
    if (lastAllExpandedRef.current === allVolumesExpanded) return
    lastAllExpandedRef.current = allVolumesExpanded
    onAllVolumesExpandedChange?.(allVolumesExpanded)
  }, [allVolumesExpanded, onAllVolumesExpandedChange])

  useEffect(() => {
    if (!onToggleAllVolumesRef) return
    onToggleAllVolumesRef.current = () => {
      setExpandedVolumes((prev) => {
        const allOpen = localVolumes.length > 0 && localVolumes.every(v => prev.has(v.id))
        return allOpen ? new Set() : new Set(localVolumes.map(v => v.id))
      })
    }
  }, [onToggleAllVolumesRef, localVolumes])

  const toggleVolume = (volumeId: string) => {
    setExpandedVolumes((prev) => {
      const next = new Set(prev)
      next.has(volumeId) ? next.delete(volumeId) : next.add(volumeId)
      return next
    })
  }

  const chaptersWithoutVolume = useMemo(
    () => localChapters.filter(c => !c.volume_id),
    [localChapters],
  )

  const getVolumeChapters = (volumeId: string) =>
    localChapters.filter(c => c.volume_id === volumeId)

  // ---------- 拖拽核心 ----------

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id)
    setActiveId(id)
    const ch = localChapters.find(c => c.id === id)
    startVolumeIdRef.current = ch ? normalizeVolumeId(ch.volume_id) : undefined
  }

  const insertChapterIntoVolume = (
    chapters: Chapter[],
    chapterId: string,
    volumeId: string,
  ): Chapter[] => {
    const idx = chapters.findIndex(c => c.id === chapterId)
    if (idx < 0) return chapters

    const moving = { ...chapters[idx], volume_id: volumeId }
    const rest = chapters.filter(c => c.id !== chapterId)

    let insertAt = rest.length
    for (let i = rest.length - 1; i >= 0; i--) {
      if (sameVolume(rest[i].volume_id, volumeId)) {
        insertAt = i + 1
        break
      }
    }

    return [...rest.slice(0, insertAt), moving, ...rest.slice(insertAt)]
  }

  /**
   * 实时排序：拖动经过其他项时，立即把 active 项移到目标位置。
   * 仅在数据实际变化时 setState，避免 dragOver 触发无限重渲染。
   */
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)
    if (activeId === overId) return

    const activeVolume = localVolumes.find(v => v.id === activeId)

    // 卷之间排序
    if (activeVolume) {
      setLocalVolumes((prev) => {
        const oldIdx = prev.findIndex(v => v.id === activeId)
        const overVolumeIdx = prev.findIndex(v => v.id === overId)
        if (oldIdx < 0 || overVolumeIdx < 0 || oldIdx === overVolumeIdx) return prev
        return arrayMove(prev, oldIdx, overVolumeIdx)
      })
      return
    }

    const activeChapter = localChapters.find(c => c.id === activeId)
    if (!activeChapter) return

    // 章节拖到根空白：移出卷到根尾部
    if (overId === ROOT_DROP_ZONE_ID) {
      if (!sameVolume(activeChapter.volume_id, null)) {
        setLocalChapters((prev) => {
          const idx = prev.findIndex(c => c.id === activeId)
          if (idx < 0 || sameVolume(prev[idx].volume_id, null)) return prev
          const moving = { ...prev[idx], volume_id: undefined }
          const rest = prev.filter(c => c.id !== activeId)
          return [...rest, moving]
        })
      }
      return
    }

    // 章节拖到卷标题：移入该卷末尾
    const overVolume = localVolumes.find(v => v.id === overId)
    if (overVolume) {
      if (!sameVolume(activeChapter.volume_id, overVolume.id)) {
        setLocalChapters(prev => insertChapterIntoVolume(prev, activeId, overVolume.id))
        setExpandedVolumes(prev => new Set([...prev, overVolume.id]))
      }
      return
    }

    // 章节拖到章节：实时排序
    const overChapter = localChapters.find(c => c.id === overId)
    if (!overChapter) return

    const targetVolumeId = normalizeVolumeId(overChapter.volume_id)

    if (sameVolume(activeChapter.volume_id, targetVolumeId)) {
      setLocalChapters((prev) => {
        const oldIdx = prev.findIndex(c => c.id === activeId)
        const newIdx = prev.findIndex(c => c.id === overId)
        if (oldIdx < 0 || newIdx < 0 || oldIdx === newIdx) return prev
        return arrayMove(prev, oldIdx, newIdx)
      })
    } else {
      setLocalChapters((prev) => {
        const oldIdx = prev.findIndex(c => c.id === activeId)
        const newIdx = prev.findIndex(c => c.id === overId)
        if (oldIdx < 0 || newIdx < 0) return prev

        const nextVolumeKey = targetVolumeId
        const needsVolumeUpdate = !sameVolume(prev[oldIdx]?.volume_id, nextVolumeKey)
        const mapped = needsVolumeUpdate
          ? prev.map(c => c.id === activeId
            ? { ...c, volume_id: nextVolumeKey ?? undefined }
            : c)
          : prev

        const fromIdx = mapped.findIndex(c => c.id === activeId)
        const toIdx = mapped.findIndex(c => c.id === overId)
        if (fromIdx < 0 || toIdx < 0 || (fromIdx === toIdx && !needsVolumeUpdate)) return prev
        return arrayMove(mapped, fromIdx, toIdx)
      })
      if (targetVolumeId) {
        setExpandedVolumes(prev => new Set([...prev, targetVolumeId]))
      }
    }
  }

  /** dragEnd：根据 localChapters/localVolumes 当前最终顺序，上报落库 */
  const handleDragEnd = (event: DragEndEvent) => {
    const wasActiveId = activeId
    setActiveId(null)
    if (!wasActiveId || !event.over) {
      startVolumeIdRef.current = undefined
      return
    }

    const finalChapter = localChapters.find(c => c.id === wasActiveId)
    const finalVolume = localVolumes.find(v => v.id === wasActiveId)

    // 卷顺序
    if (finalVolume) {
      const reordered = localVolumes.map((v, i) => ({ ...v, order_index: i }))
      setLocalVolumes(reordered)
      onReorderVolumes?.(reordered)
      startVolumeIdRef.current = undefined
      return
    }

    // 章节
    if (finalChapter) {
      const startVolumeId = startVolumeIdRef.current
      const endVolumeId = normalizeVolumeId(finalChapter.volume_id)
      const movedAcrossVolumes = startVolumeId !== endVolumeId

      if (movedAcrossVolumes) {
        onMoveChapterToVolume?.(wasActiveId, endVolumeId)
      } else {
        const containerChapters = localChapters
          .filter(c => sameVolume(c.volume_id, endVolumeId))
          .map((c, i) => ({ ...c, order_index: i }))
        onReorderChapters?.(containerChapters)
      }
    }
    startVolumeIdRef.current = undefined
  }

  const handleDragCancel = () => {
    setActiveId(null)
    startVolumeIdRef.current = undefined
    // 取消时回滚到 props（避免假状态停留）
    setLocalChapters(chapters || [])
    setLocalVolumes(volumes || [])
  }

  const activeItem = activeId
    ? localChapters.find(c => c.id === activeId) || localVolumes.find(v => v.id === activeId)
    : null

  // SortableContext 的 items 顺序必须与 DOM 渲染顺序一致，否则 dnd-kit 的命中计算会错
  const sortableIds = useMemo(() => {
    const ids: string[] = []
    for (const v of localVolumes) {
      ids.push(v.id)
      for (const c of getVolumeChapters(v.id)) ids.push(c.id)
    }
    for (const c of chaptersWithoutVolume) ids.push(c.id)
    return ids
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localVolumes, localChapters])

  const hasContent = localChapters.length > 0 || localVolumes.length > 0
  const draggingChapterFromVolume = !!(
    activeId && localChapters.find(c => c.id === activeId && c.volume_id)
  )

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-2 scrollbar-none">
      {!hasContent
        ? (
            <EmptyChapters onCreateChapter={onCreateChapter} onCreateVolume={onCreateVolume} />
          )
        : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                {draggingChapterFromVolume && (
                  <RootDropHint
                    label={t('editor.leftPanel.chapters.rootDrop.idle')}
                    hoverLabel={t('editor.leftPanel.chapters.rootDrop.over')}
                  />
                )}

                {localVolumes.map(volume => (
                  <VolumeItem
                    key={volume.id}
                    volume={volume}
                    isExpanded={expandedVolumes.has(volume.id)}
                    chapterCount={getVolumeChapters(volume.id).length}
                    onToggle={() => toggleVolume(volume.id)}
                    onRename={onRenameVolume}
                    onDelete={onDeleteVolume}
                    onCreateChapter={onCreateChapterInVolume}
                  >
                    {getVolumeChapters(volume.id).map(chapter => (
                      <ChapterItem
                        key={chapter.id}
                        chapter={chapter}
                        isSelected={selectedChapter === chapter.id}
                        onSelect={() => onSelectChapter(chapter.id)}
                        onRename={onRenameChapter}
                        onRenameInline={onRenameChapterInline}
                        onDelete={onDeleteChapter}
                        onCopy={onCopyChapter}
                        onMove={onMoveChapter}
                      />
                    ))}
                  </VolumeItem>
                ))}

                {chaptersWithoutVolume.map(chapter => (
                  <ChapterItem
                    key={chapter.id}
                    chapter={chapter}
                    isSelected={selectedChapter === chapter.id}
                    onSelect={() => onSelectChapter(chapter.id)}
                    onRename={onRenameChapter}
                    onRenameInline={onRenameChapterInline}
                    onDelete={onDeleteChapter}
                    onCopy={onCopyChapter}
                    onMove={onMoveChapter}
                  />
                ))}
              </SortableContext>

              <DragOverlay dropAnimation={null}>
                {activeItem
                  ? (
                      <div className="bg-card rounded-md shadow-lg border border-border px-2 py-1 max-w-[280px] cursor-grabbing">
                        <div className="text-[12px] text-foreground flex items-center gap-1.5 truncate">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{activeItem.title}</span>
                        </div>
                      </div>
                    )
                  : null}
              </DragOverlay>
            </DndContext>
          )}
    </div>
  )
}

function RootDropHint({ label, hoverLabel }: { label: string, hoverLabel: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: ROOT_DROP_ZONE_ID })
  return (
    <div
      ref={setNodeRef}
      className={`mb-1 flex h-7 items-center justify-center rounded-md border border-dashed text-[11px] transition-colors ${
        isOver
          ? 'border-primary bg-primary/10 text-foreground'
          : 'border-border/60 text-muted-foreground'
      }`}
    >
      {isOver ? hoverLabel : label}
    </div>
  )
}
