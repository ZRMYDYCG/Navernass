import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import type { Novel } from '@/lib/supabase/sdk'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { NovelCard } from './novel-card'

interface NovelListProps {
  novels: Novel[]
  loading: boolean
  onOpenNovel: (novel: Novel) => void
  onEditNovel?: (novel: Novel) => void
  onDeleteNovel?: (novel: Novel) => void
  onContextMenu?: (e: React.MouseEvent, novel: Novel) => void
  onCreateNovel?: () => void
  onReorder?: (novels: Novel[]) => void
}

function SortableNovelCard({
  novel,
  onOpen,
  onContextMenu,
}: {
  novel: Novel
  onOpen: (novel: Novel) => void
  onContextMenu?: (e: React.MouseEvent, novel: Novel) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: novel.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <NovelCard
        novel={novel}
        onOpen={onOpen}
        onContextMenu={onContextMenu}
        dragListeners={listeners}
      />
    </div>
  )
}

export function NovelList({
  novels,
  loading,
  onOpenNovel,
  onContextMenu,
  onReorder,
}: NovelListProps) {
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = novels.findIndex(item => item.id === active.id)
      const newIndex = novels.findIndex(item => item.id === over.id)
      const newItems = arrayMove(novels, oldIndex, newIndex)
      onReorder?.(newItems)
    }

    setActiveId(null)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-start pt-[30vh] min-h-[60vh] gap-3">
        <Spinner className="w-6 h-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground font-serif not-italic">加载中...</span>
      </div>
    )
  }

  if (novels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-start pt-[25vh] min-h-[60vh] text-muted-foreground font-serif">
        <p className="text-lg">暂无创作</p>
        <p className="text-sm text-muted-foreground/70 text-center mt-2">
          开始你的第一部小说创作吧
        </p>
      </div>
    )
  }

  const activeNovel = activeId ? novels.find(n => n.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={novels.map(n => n.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pb-8">
          {novels.map(novel => (
            <SortableNovelCard
              key={novel.id}
              novel={novel}
              onOpen={onOpenNovel}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeNovel
          ? (
              <NovelCard
                novel={activeNovel}
                onOpen={() => { }}
                onContextMenu={(e) => {
                  e.preventDefault()
                }}
                dragListeners={{}}
              />
            )
          : null}
      </DragOverlay>
    </DndContext>
  )
}
