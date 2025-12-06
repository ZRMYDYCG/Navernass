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
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { NovelCard } from './novel-card'

interface NovelListProps {
  novels: Novel[]
  loading: boolean
  onOpenNovel: (novel: Novel) => void
  onEditNovel?: (novel: Novel) => void
  onDeleteNovel?: (novel: Novel) => void
  onCreateNovel: () => void
  onReorder?: (novels: Novel[]) => void
}

function SortableNovelCard({
  novel,
  onOpen,
  onEdit,
  onDelete,
}: {
  novel: Novel
  onOpen: (novel: Novel) => void
  onEdit?: (novel: Novel) => void
  onDelete?: (novel: Novel) => void
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <NovelCard
        novel={novel}
        onOpen={onOpen}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  )
}

export function NovelList({
  novels,
  loading,
  onOpenNovel,
  onEditNovel,
  onDeleteNovel,
  onCreateNovel,
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
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner className="w-6 h-6 text-stone-400" />
        <span className="text-sm text-stone-400 font-serif">加载中...</span>
      </div>
    )
  }

  if (novels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-400 dark:text-zinc-500 font-serif">
        <p className="text-lg mb-4 italic">Empty pages...</p>
        <Button
          onClick={onCreateNovel}
          className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-sans"
        >
          <Plus className="w-4 h-4 mr-2" />
          Start Writing
        </Button>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-8">
          {novels.map(novel => (
            <SortableNovelCard
              key={novel.id}
              novel={novel}
              onOpen={onOpenNovel}
              onEdit={onEditNovel}
              onDelete={onDeleteNovel}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeNovel
          ? (
              <NovelCard
                novel={activeNovel}
                onOpen={() => {}}
              />
            )
          : null}
      </DragOverlay>
    </DndContext>
  )
}
